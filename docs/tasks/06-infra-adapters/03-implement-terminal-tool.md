# Sub-tarefa: Implementar Terminal Tool Adapter

## Descrição:

Implementar uma classe de adapter na camada de Infraestrutura que fornece a implementação concreta para a interface `TerminalTool.interface.ts` (ou similar, se definida).

## Contexto:

O `AutonomousAgent` precisará executar comandos no terminal para realizar diversas ações (ex: rodar linters, formatadores, comandos git, etc.). A interface `TerminalTool` define o contrato para essas operações na camada de Aplicação. O Terminal Tool Adapter na camada de Infraestrutura será responsável por traduzir essas chamadas genéricas para a execução real de comandos no sistema operacional.

## Specific Instructions:

1. Crie um novo arquivo para o Terminal Tool Adapter (ex: `src/infrastructure/adapters/tools/terminal.tool.adapter.ts`).
2. Defina a classe do adapter e faça com que ela implemente a interface `TerminalTool.interface.ts` (ou a interface de Tool genérica se `TerminalTool` não for uma interface separada).
3. Injete as dependências necessárias para executar comandos no terminal (ex: módulos `child_process` do Node.js).
4. Implemente os métodos definidos na interface `TerminalTool` (ex: `executeCommand`).
5. Garanta que o adapter traduza corretamente os parâmetros (comando, argumentos, diretório de trabalho) e retornos (stdout, stderr, código de saída) entre a interface genérica e a execução real do comando.
6. Mantenha a lógica específica de execução de comandos isolada dentro deste adapter.
7. Adicione tratamento de erros apropriado para a execução de comandos (ex: comando não encontrado, erro de execução).
8. Adicione comentários JSDoc explicando o propósito da classe, do construtor e dos métodos.
9. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo contendo a implementação de um Terminal Tool Adapter na camada de Infraestrutura, aderindo à interface `TerminalTool.interface.ts` (ou Tool genérica) e utilizando APIs para executar comandos no terminal.