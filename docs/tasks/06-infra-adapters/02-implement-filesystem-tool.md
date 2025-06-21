# Sub-tarefa: Implementar FileSystem Tool Adapter

## Descrição:

Implementar uma classe de adapter na camada de Infraestrutura que fornece a implementação concreta para a interface `FileSystemTool.interface.ts` (ou similar, se definida).

## Contexto:

O `AutonomousAgent` precisará interagir com o sistema de arquivos para ler e escrever código, documentação, etc. A interface `FileSystemTool` define o contrato para essas operações na camada de Aplicação. O FileSystem Tool Adapter na camada de Infraestrutura será responsável por traduzir essas chamadas genéricas para as APIs específicas do sistema operacional ou bibliotecas de manipulação de arquivos.

## Specific Instructions:

1. Crie um novo arquivo para o FileSystem Tool Adapter (ex: `src/infrastructure/adapters/tools/filesystem.tool.adapter.ts`).
2. Defina a classe do adapter e faça com que ela implemente a interface `FileSystemTool.interface.ts` (ou a interface de Tool genérica se `FileSystemTool` não for uma interface separada).
3. Injete as dependências necessárias para interagir com o sistema de arquivos (ex: módulos `fs` do Node.js).
4. Implemente os métodos definidos na interface `FileSystemTool` (ex: `readFile`, `writeFile`, `listFiles`, `createDirectory`).
5. Garanta que o adapter traduza corretamente os parâmetros e retornos entre a interface genérica e as APIs do sistema de arquivos.
6. Mantenha a lógica específica de interação com o sistema de arquivos isolada dentro deste adapter.
7. Adicione tratamento de erros apropriado para operações de arquivo (ex: arquivo não encontrado, permissão negada).
8. Adicione comentários JSDoc explicando o propósito da classe, do construtor e dos métodos.
9. Não crie testes nesta fase.

## Expected Deliverable:

Um novo arquivo contendo a implementação de um FileSystem Tool Adapter na camada de Infraestrutura, aderindo à interface `FileSystemTool.interface.ts` (ou Tool genérica) e utilizando APIs do sistema de arquivos.