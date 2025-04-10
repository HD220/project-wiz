# ADR-0014: Persistência e Acesso ao Histórico de Conversas com SQLite, Drizzle ORM e IPC Seguro

## Status

Aceito

## Contexto

A aplicação requer um mecanismo eficiente, seguro e local para armazenar o histórico de conversas entre usuário e assistente, com suporte a múltiplas conversas, exportação e fácil integração com o frontend React.

## Decisão

### Banco de Dados Local: SQLite + Drizzle ORM
- Utilizamos SQLite para persistência local, por ser leve, embutido, sem necessidade de servidor externo e amplamente suportado.
- O Drizzle ORM foi escolhido para abstrair o acesso ao SQLite, fornecendo tipagem Typescript, migrações seguras e consultas expressivas.

### Modelagem
- Tabelas `conversations` e `messages` com relacionamento 1:N.
- Conversas possuem `id`, timestamps e título.
- Mensagens possuem `id`, `conversationId`, `role` (usuário ou assistente), conteúdo e timestamp.

### Serviço `HistoryService`
- Interface define métodos assíncronos para:
  - Criar conversa (`createConversation`)
  - Adicionar mensagem (`addMessage`)
  - Listar conversas com paginação e busca (`getConversations`)
  - Listar mensagens de uma conversa (`getMessages`)
  - Deletar conversa e mensagens associadas (`deleteConversation`)
  - Renomear conversa (`renameConversation`)
  - Exportar histórico em JSON ou CSV (`exportHistory`)
- Implementação simples, baseada em Drizzle, com UUIDs para chaves primárias.

### Comunicação Segura via Preload API + IPC
- A API do serviço é exposta no frontend via `contextBridge` no preload script.
- Métodos são acessados por `window.historyAPI`, que usa `ipcRenderer.invoke` para chamadas assíncronas.
- A tipagem é definida em `electronAPI.d.ts`, garantindo segurança e autocompletar no frontend.
- O processo principal gerencia o acesso ao banco, evitando exposição direta do SQLite ao frontend.

### Hook React `useHistory`
- Encapsula chamadas à API IPC, gerenciando estado, loading e erros.
- Fornece métodos para criar, buscar, deletar, renomear conversas, adicionar mensagens e exportar dados.
- Facilita integração com componentes React, mantendo isolamento da lógica IPC.

## Justificativas Técnicas

- **SQLite**: solução madura, sem dependências externas, ideal para persistência local.
- **Drizzle ORM**: abstração leve, com tipagem Typescript, facilitando manutenção e evitando SQL manual.
- **IPC seguro**: evita exposição do banco ao frontend, reduzindo riscos de segurança.
- **Hook React**: simplifica consumo da API, melhora experiência do desenvolvedor.

## Alternativas Consideradas

- **Persistência em arquivos JSON**: simples, mas difícil de escalar, consultar e manter integridade.
- **Outros ORMs (Prisma, TypeORM)**: mais complexos ou pesados para o escopo local.
- **Persistência remota (Firebase, Supabase)**: não atende requisito de funcionamento offline/local.
- **Acesso direto ao SQLite no frontend**: inseguro e difícil de manter.

## Consequências

- Solução simples, segura e eficiente para histórico local.
- Fácil extensão futura (ex: tags, favoritos, anexos).
- Exportação facilitada para backup ou análise.
- Onboarding simplificado para novos desenvolvedores.

## Referências

- [SQLite](https://sqlite.org)
- [Drizzle ORM](https://orm.drizzle.team)
- [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)