# Guia: Tratamento de Erros e Validação de Dados

Este documento descreve as abordagens para tratamento de erros e validação de dados no Project Wiz, essenciais para a robustez e confiabilidade da aplicação.

## 1. Validação de Dados com Zod

A principal ferramenta para validação de dados de entrada no Project Wiz é o **[Zod](https://zod.dev/)**.

*   **Propósito:** Zod é usado para definir schemas para estruturas de dados e validar se os dados de entrada (ex: de APIs, configurações de Job, interações do usuário) conformam-se a esses schemas.
*   **Uso Mandatório:** Toda entrada de dados proveniente de fontes não confiáveis ou externas deve passar por uma validação com Zod antes de ser processada pela lógica de negócios.
*   **Type Safety:** Ao usar Zod para definir schemas, podemos inferir tipos TypeScript, garantindo que nossos tipos estáticos e validações de tempo de execução estejam sincronizados.
*   **Local de Validação:** A validação deve ocorrer o mais próximo possível da entrada dos dados no sistema (ex: no início de um caso de uso, ao receber dados via IPC, ao processar o payload de um Job).

Consulte as [Diretrizes para Zod](./02-best-practices.md#zod-best-practices) para melhores práticas sobre como definir e utilizar schemas Zod.

## 2. Tratamento de Exceções

O tratamento de exceções é fundamental para lidar com erros inesperados ou condições anormais durante a execução do código.

*   **Blocos `try/catch`:** São o mecanismo padrão para capturar exceções síncronas e assíncronas (com `async/await`).
    ```typescript
    try {
      // Código que pode lançar uma exceção
      const result = await algumaOperacaoPerigosa();
      return result;
    } catch (error) {
      // Lidar com o erro:
      // 1. Logar o erro para depuração.
      // 2. Relançar uma exceção mais específica ou encapsulada, se apropriado.
      // 3. Retornar um estado de erro definido para o chamador.
      // 4. Realizar ações de cleanup, se necessário.
      console.error("Ocorreu um erro:", error instanceof Error ? error.message : String(error));
      throw new CustomDomainError("Falha ao processar X devido a: " + (error instanceof Error ? error.message : String(error)));
    }
    ```
*   **Tipos de Erro Personalizados:** Quando apropriado, defina classes de erro personalizadas que herdam de `Error` para representar tipos específicos de falhas no domínio da aplicação. Isso facilita a diferenciação e o tratamento de erros específicos.
    ```typescript
    class JobProcessingError extends Error {
      constructor(message: string, public jobId?: string) {
        super(message);
        this.name = "JobProcessingError";
      }
    }
    ```
*   **Exceções em Agentes e Jobs:**
    *   Conforme descrito na [Arquitetura de Software](./01-software-architecture.md) (especialmente seções sobre Jobs e Workers), quando um Agente lança uma exceção, o Worker responsável captura essa exceção.
    *   O Worker então notifica a Fila (Queue) sobre a falha, que por sua vez gerencia o estado do Job (ex: movendo para `failed` ou `delayed` para retentativa) e armazena a informação do erro.
*   **Não Suprimir Erros Silenciosamente:** Evite capturar erros e não fazer nada com eles (ex: um bloco `catch` vazio), a menos que seja intencional e justificado. Isso pode esconder problemas e dificultar a depuração.

## 3. Feedback para o Usuário

*   Quando erros ocorrem devido a entradas inválidas do usuário ou falhas que o usuário pode corrigir, a interface deve apresentar mensagens de erro claras e úteis.
*   Para erros de sistema inesperados, forneça uma forma do usuário relatar o problema, possivelmente com um identificador de erro que possa ser rastreado nos logs.

## Conclusão

Uma estratégia consistente de validação de dados com Zod e um tratamento de exceções cuidadoso são essenciais para construir um Project Wiz confiável e fácil de manter. Ao validar entradas e gerenciar erros de forma proativa, podemos melhorar a experiência do usuário e a estabilidade geral do sistema.

Consulte também as [Diretrizes de Segurança](./security-guidelines.md) para aspectos relacionados à validação de inputs.
