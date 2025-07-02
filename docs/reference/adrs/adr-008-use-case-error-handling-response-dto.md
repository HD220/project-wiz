# ADR-008: Padrão de Tratamento de Erros e Resposta para Casos de Uso

**Status:** Aceito

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

**Mecanismo de Tratamento de Erros e Implementação com Decorator:**

Para aplicar este padrão de forma consistente e evitar repetição de código (DRY), a abordagem preferencial é utilizar um Decorator (`UseCaseWrapper`) que envolve a execução do caso de uso real.

1.  **Caso de Uso Concreto (Lógica de Negócio Pura):**
    *   A classe do caso de uso concreto foca exclusivamente na lógica de negócio e na orquestração do fluxo principal.
    *   Ela valida o DTO de entrada (ex: com Zod, podendo lançar `ZodError`).
    *   Ela interage com entidades de domínio e repositórios (que podem lançar `CoreError`s como `DomainError`, `NotFoundError`, `ValueError`, `EntityError`).
    *   Em caso de sucesso, retorna diretamente `successUseCaseResponse(data)`.
    *   **Importante:** O caso de uso concreto *não* implementa o bloco `try/catch` para mapeamento de erro para `IUseCaseResponse`. Ele lança exceções diretamente.

2.  **`UseCaseWrapper` (Decorator):**
    *   Esta classe envolve uma instância do caso de uso concreto e uma instância de `ILogger`.
    *   O método `execute` do wrapper chama o `execute` do caso de uso concreto dentro de um bloco `try/catch`.
    *   **Captura e Mapeamento de Exceções:** No bloco `catch` do wrapper:
        *   A exceção original é logada com detalhes (nome do caso de uso, input, stack trace).
        *   A exceção é analisada (ex: `instanceof ZodError`, `instanceof CoreError`, `instanceof Error`).
        *   Com base no tipo de erro, um objeto `IUseCaseErrorDetails` é populado com `name`, `message`, `code`, `details` e `cause`.
        *   O wrapper retorna `errorUseCaseResponse(errorDetails)`.
    *   Se o caso de uso concreto completar sem exceções, o wrapper repassa a resposta de sucesso.

3.  **Injeção de Dependência:**
    *   O container de DI (ex: InversifyJS) é configurado para que, ao solicitar uma interface de caso de uso (ex: `IUseCase<Input, Output>`), ele forneça uma instância do `UseCaseWrapper`, que por sua vez tem o caso de uso concreto e o logger injetados.

Esta abordagem com Decorator centraliza a lógica de tratamento de erros e logging, mantendo os casos de uso concretos limpos, focados em suas responsabilidades e mais fáceis de testar.

**Hierarquia de Erros Base:**

Para facilitar o mapeamento no `UseCaseWrapper`, será definida uma classe base `CoreError` (`src_refactored/shared/errors/core.error.ts`) da qual herdarão os erros específicos de domínio (`DomainError`, `EntityError`, `ValueError`) e aplicação (`ApplicationError`, `NotFoundError` quando referente à lógica de aplicação). Erros de validação de entrada (`ZodError`) e erros genéricos (`Error`) também são tratados especificamente pelo wrapper.

**Exemplo de Implementação (Conceitual do Wrapper):**

```typescript
// imports ...
// imports ...
// IUseCase, IUseCaseResponse, successUseCaseResponse, errorUseCaseResponse, IUseCaseErrorDetails
// ILogger, ZodError, CoreError, ConcreteUseCase, ConcreteUseCaseInput, ConcreteUseCaseOutput

/**
 * Conceptual example of UseCaseWrapper
 */
class UseCaseWrapper<TInput, TOutput> implements IUseCase<TInput, TOutput> {
  constructor(
    private readonly decoratedUseCase: IUseCase<TInput, TOutput>,
    private readonly logger: ILogger,
  ) {}

  async execute(input: TInput): Promise<IUseCaseResponse<TOutput>> {
    try {
      return await this.decoratedUseCase.execute(input);
    } catch (err: any) {
      this.logger.error(
        `Error in UseCase ${this.decoratedUseCase.constructor.name} with input: ${JSON.stringify(input)}`,
        { errorName: err.name, errorMessage: err.message, errorStack: err.stack, cause: err.cause }
      );

      let errorDetails: IUseCaseErrorDetails;

      if (err instanceof ZodError) {
        errorDetails = {
          name: 'ValidationError',
          message: 'Input validation failed.',
          code: 'VALIDATION_ERROR',
          details: err.flatten().fieldErrors,
          cause: err,
        };
      } else if (err instanceof CoreError) {
        errorDetails = {
          name: err.name,
          message: err.message,
          code: err.code || `CORE_${err.name.toUpperCase()}`,
          details: err.details,
          cause: err,
        };
      } else if (err instanceof Error) { // Fallback for generic errors
        errorDetails = {
          name: err.name || 'SystemError',
          message: 'An unexpected system error occurred.',
          code: 'UNEXPECTED_SYSTEM_ERROR',
          cause: err,
        };
      } else { // Non-Error exceptions
        errorDetails = {
          name: 'UnknownError',
          message: 'An unknown error occurred.',
          code: 'UNKNOWN_ERROR',
          details: err,
        };
      }
      return errorUseCaseResponse(errorDetails);
    }
  }
}

/**
 * Conceptual example of a Concrete Use Case (no try/catch for IUseCaseResponse mapping)
 */
class MyConcreteUseCase implements IUseCase<IMyUseCaseInput, IMyUseCaseOutput> {
  constructor(private readonly repository: IMyRepository) {}

  async execute(input: IMyUseCaseInput): Promise<IUseCaseResponse<IMyUseCaseOutput>> {
    // 1. Validate input (e.g., MyUseCaseInputSchema.parse(input))
    //    This can throw ZodError.

    // 2. Business logic
    //    This can throw CoreError (e.g., NotFoundError, DomainError).
    //    Example:
    //    const entity = await this.repository.findById(input.id);
    //    if (!entity) {
    //      throw new NotFoundError(`Entity with id ${input.id} not found.`);
    //    }
    //    entity.doSomethingOrThrow();

    // 3. Prepare output
    const output: IMyUseCaseOutput = { result: "some data" }; // Placeholder
    return successUseCaseResponse(output); // Return success directly
  }
}
```

**Consequências:**

*   **Positivas:**
    *   **Contrato Claro:** As camadas chamadoras sempre esperam um `IUseCaseResponse`.
    *   **Tratamento de Erro Centralizado (no `UseCaseWrapper`):** A lógica de captura, logging e mapeamento de erros é centralizada, seguindo o princípio DRY.
    *   **Casos de Uso Limpos (SRP):** Os casos de uso concretos focam apenas na lógica de negócio, lançando exceções quando necessário, sem se preocupar com a formatação da resposta de erro.
    *   **Melhor Experiência do Desenvolvedor:** Simplifica a criação e o consumo dos casos de uso.
    *   **Consistência:** Garante que todos os casos de uso sigam rigorosamente o mesmo padrão de resposta e tratamento de erro.
    *   **Facilidade de Teste:**
        *   Casos de uso concretos podem ser testados verificando se lançam as exceções corretas.
        *   O `UseCaseWrapper` pode ser testado isoladamente para garantir que mapeia corretamente diferentes tipos de erro.

*   **Negativas/Desafios:**
    *   **Configuração da DI:** A configuração da injeção de dependência para o Decorator pode adicionar uma pequena complexidade inicial.
    *   **Refatoração:** Casos de uso existentes precisarão ser adaptados para não mais implementarem o `try/catch` de mapeamento de erro e para lançarem exceções diretamente.

**Alternativas Consideradas:**

1.  **Manter o `Result` Helper:** Rejeitado devido à preferência por uma API de retorno mais explícita (`success` flag) e menos "funcional" para este contexto.
2.  **Lançar Exceções Diretamente dos Casos de Uso:** Rejeitado porque o requisito era que o caso de uso, como ponto de entrada da aplicação core, deveria fornecer uma resposta encapsulada, não propagar exceções que a camada de apresentação/infraestrutura teria que conhecer e tratar individualmente.

Este ADR visa padronizar e simplificar a forma como os resultados e erros são comunicados pelos casos de uso, promovendo um design mais robusto e de fácil manutenção.
