# ADR-008: Padrão de Tratamento de Erros e Resposta para Casos de Uso

**Status:** Proposto

**Contexto:**

Durante a refatoração do sistema, identificou-se a necessidade de um padrão consistente e claro para o tratamento de erros e a forma como os casos de uso (Use Cases) comunicam seus resultados para as camadas superiores (ex: Controladores, Gateways de API). A abordagem anterior utilizando um helper `Result<Success, Error>` foi considerada verbosa e com uma curva de aprendizado que poderia ser simplificada. Além disso, surgiu o requisito de que os casos de uso não devem propagar exceções diretamente, mas sim encapsular o resultado (sucesso ou falha) em um objeto de transferência de dados (DTO) padronizado.

**Decisão:**

Adotar um DTO de resposta padrão para todos os casos de uso, denominado `IUseCaseResponse`. Este DTO servirá como um envelope para o resultado da execução do caso de uso, indicando explicitamente se a operação foi bem-sucedida ou se ocorreu um erro.

**Estrutura do DTO de Resposta:**

O DTO `IUseCaseResponse` será definido da seguinte forma (localizado em `src_refactored/shared/application/use-case-response.dto.ts`):

```typescript
interface IUseCaseErrorDetails {
  readonly name: string;       // Ex: 'ValidationError', 'NotFoundError', 'DomainError'
  readonly message: string;    // Mensagem descritiva do erro
  readonly code?: string;       // Código de erro específico da aplicação (opcional)
  readonly details?: any;       // Detalhes adicionais, como erros de validação de campos (ZodError.flatten())
  readonly cause?: Error;       // Erro original (para logging, não expor ao cliente)
}

interface IUseCaseResponse<TOutput = void, TErrorDetails = IUseCaseErrorDetails> {
  readonly success: boolean;
  readonly data?: TOutput;        // Presente se success === true e TOutput não for void
  readonly error?: TErrorDetails; // Presente se success === false
}
```

Serão fornecidas também funções utilitárias para facilitar a criação dessas respostas:

```typescript
function successUseCaseResponse<TOutput = void>(data: TOutput): SuccessUseCaseResponse<TOutput>;
function errorUseCaseResponse<TErrorDetails = IUseCaseErrorDetails>(errorDetails: TErrorDetails): ErrorUseCaseResponse<TErrorDetails>;
```

E tipos utilitários para melhor inferência:
```typescript
type SuccessUseCaseResponse<TOutput = void> = IUseCaseResponse<TOutput, any> & { success: true; data: TOutput; error?: never; };
type ErrorUseCaseResponse<TErrorDetails = IUseCaseErrorDetails> = IUseCaseResponse<any, TErrorDetails> & { success: false; data?: never; error: TErrorDetails; };
```

**Mecanismo de Tratamento de Erros nos Casos de Uso:**

1.  **Captura de Exceções:** Dentro do método `execute` de um caso de uso, todo o código que pode lançar exceções (interações com o domínio, repositórios, serviços externos) será envolvido em blocos `try/catch`.
2.  **Mapeamento para `IUseCaseErrorDetails`:**
    *   No bloco `catch`, a exceção capturada será analisada.
    *   Informações relevantes da exceção (ex: `error.name`, `error.message`, `error.cause`, detalhes de `ZodError`) serão mapeadas para a estrutura `IUseCaseErrorDetails`.
    *   É crucial loggar a exceção original completa (incluindo stack trace) para fins de depuração antes de retornar a resposta mapeada.
3.  **Retorno do `IUseCaseResponse`:**
    *   Se a execução for bem-sucedida, o caso de uso retornará `successUseCaseResponse(data)`.
    *   Se uma exceção for capturada, o caso de uso retornará `errorUseCaseResponse(errorDetails)`, onde `errorDetails` é o objeto `IUseCaseErrorDetails` populado.

**Exemplo de Implementação em um Caso de Uso:**

```typescript
// imports ...
// IMyUseCaseInput, IMyUseCaseOutput, IMyRepository, DomainEntity, CustomDomainError, etc.
// IUseCaseResponse, successUseCaseResponse, errorUseCaseResponse, IUseCaseErrorDetails

class MyUseCase implements IUseCase<IMyUseCaseInput, IUseCaseResponse<IMyUseCaseOutput>> {
  constructor(private readonly repository: IMyRepository, private readonly logger: ILogger) {}

  async execute(input: IMyUseCaseInput): Promise<IUseCaseResponse<IMyUseCaseOutput>> {
    try {
      // 1. Validar input (pode ser com Zod, gerando ZodError)
      // const validatedInput = MyUseCaseInputSchema.parse(input);

      // 2. Lógica de negócio, criação/busca de entidades
      // const entity = await this.repository.findById(validatedInput.id);
      // if (!entity) {
      //   throw new NotFoundError(`Entity with id ${validatedInput.id} not found.`);
      // }
      // entity.doSomethingImportant(validatedInput.someValue);

      // 3. Persistir alterações (se houver)
      // await this.repository.save(entity);

      // 4. Preparar dados de output
      // const output: IMyUseCaseOutput = { result: entity.getResult() };
      const output: IMyUseCaseOutput = { result: "some data" }; // Placeholder

      return successUseCaseResponse(output);

    } catch (err: any) {
      this.logger.error(`Error in MyUseCase: ${err.message}`, { error: err, stack: err.stack, input });

      let errorDetails: IUseCaseErrorDetails;

      if (err instanceof ZodError) {
        errorDetails = {
          name: 'ValidationError',
          message: 'Input validation failed.',
          details: err.flatten().fieldErrors,
          cause: err,
        };
      } else if (err instanceof DomainError || err instanceof NotFoundError || err instanceof ValueError) { // Supondo essas classes de erro customizadas
        errorDetails = {
          name: err.name,
          message: err.message,
          code: err.code, // Se seus erros customizados tiverem um 'code'
          cause: err,
        };
      } else {
        // Erro inesperado
        errorDetails = {
          name: 'ApplicationError',
          message: 'An unexpected internal server error occurred.',
          // Não expor detalhes de erros desconhecidos diretamente
          cause: err,
        };
      }
      return errorUseCaseResponse(errorDetails);
    }
  }
}
```

**Consequências:**

*   **Positivas:**
    *   **Contrato Claro:** As camadas chamadoras sempre esperam um `IUseCaseResponse` e podem inspecionar a propriedade `success` para determinar o resultado.
    *   **Tratamento de Erro Centralizado (no Use Case):** Os casos de uso se tornam responsáveis por capturar, logar e mapear erros, evitando que exceções "vazem" para camadas superiores de forma não controlada.
    *   **Melhor Experiência do Desenvolvedor:** Simplifica o consumo dos casos de uso, pois não é necessário envolver cada chamada em `try/catch` pela camada de apresentação (a menos que a própria camada de apresentação queira tratar falhas de comunicação, etc.).
    *   **Consistência:** Todos os casos de uso seguirão o mesmo padrão de retorno.
    *   **Facilidade de Teste:** Os testes podem verificar o objeto de resposta, incluindo os detalhes do erro, de forma estruturada.

*   **Negativas/Desafios:**
    *   **Overhead de Mapeamento:** Haverá um pequeno overhead ao mapear exceções para `IUseCaseErrorDetails` em cada bloco `catch`.
    *   **Disciplina Necessária:** Requer disciplina dos desenvolvedores para implementar corretamente os blocos `try/catch` e o mapeamento em todos os casos de uso.
    *   **Refatoração:** Casos de uso existentes que usam o `Result` helper ou lançam exceções diretamente precisarão ser refatorados.

**Alternativas Consideradas:**

1.  **Manter o `Result` Helper:** Rejeitado devido à preferência por uma API de retorno mais explícita (`success` flag) e menos "funcional" para este contexto.
2.  **Lançar Exceções Diretamente dos Casos de Uso:** Rejeitado porque o requisito era que o caso de uso, como ponto de entrada da aplicação core, deveria fornecer uma resposta encapsulada, não propagar exceções que a camada de apresentação/infraestrutura teria que conhecer e tratar individualmente.

Este ADR visa padronizar e simplificar a forma como os resultados e erros são comunicados pelos casos de uso, promovendo um design mais robusto e de fácil manutenção.
