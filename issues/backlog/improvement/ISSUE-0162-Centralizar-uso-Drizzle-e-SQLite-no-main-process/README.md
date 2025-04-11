# ISSUE-0162 - Centralizar uso do Drizzle ORM e SQLite no processo main do Electron

## Contexto

Atualmente, o acesso ao banco de dados SQLite via Drizzle está disperso em múltiplos arquivos e processos. Isso dificulta:

- A manutenção e evolução do código.
- O controle de conexões e transações.
- A implementação de segurança e validações centralizadas.
- A testabilidade e isolamento do acesso ao banco.

## Objetivo

- **Centralizar toda a lógica de acesso ao SQLite via Drizzle ORM em um único módulo ou serviço** no processo `main` do Electron.
- Definir uma API clara para operações CRUD e consultas.
- Isolar a configuração da conexão, migrations e inicialização do banco.
- Facilitar a comunicação via IPC com o renderer/preload, evitando chamadas diretas dispersas.
- Garantir que o módulo seja facilmente testável e extensível.

## Escopo

- Mapear todos os pontos atuais onde Drizzle/SQLite são utilizados no processo `main`.
- Criar um módulo dedicado, por exemplo, `src/core/infrastructure/electron/db-service.ts`.
- Mover e consolidar toda a lógica de conexão, queries e migrations para esse módulo.
- Expor métodos públicos claros para uso interno e via IPC.
- Atualizar os pontos de uso para consumir a API centralizada.
- Documentar a API e o fluxo de inicialização.

## Critérios de Aceite

- Toda a comunicação com o SQLite via Drizzle deve passar pelo módulo centralizado.
- O módulo deve ser facilmente mockável para testes.
- O build e funcionamento do app não devem ser impactados negativamente.
- Código alinhado com Clean Architecture e ADRs do projeto.

## Observações

- Relacionada à melhoria da arquitetura e manutenção do projeto.
- Pode facilitar futuras migrações ou substituições do banco.
- Complementar à correção do build do processo `main`.

## Categoria

improvement