# Guia Rápido: Histórico de Conversas

Este guia orienta desenvolvedores a utilizar, estender e manter o sistema de histórico de conversas baseado em SQLite, Drizzle ORM e IPC seguro.

---

## Acessando o Histórico no Frontend

### Via Hook React

Utilize o hook `useHistory`:

```tsx
import { useHistory } from "@/client/hooks/use-history";

const {
  conversations,
  messages,
  selectedConversation,
  loading,
  error,
  fetchConversations,
  selectConversation,
  fetchMessages,
  createConversation,
  addMessage,
  deleteConversation,
  renameConversation,
  exportHistory,
} = useHistory();
```

### Fluxo Básico

- **Listar conversas:** `fetchConversations()`
- **Selecionar conversa:** `selectConversation(conversation)`
- **Buscar mensagens:** `fetchMessages(conversationId)`
- **Criar conversa:** `createConversation(title?)`
- **Adicionar mensagem:** `addMessage(conversationId, role, content)`
- **Deletar conversa:** `deleteConversation(conversationId)`
- **Renomear conversa:** `renameConversation(conversationId, newTitle)`
- **Exportar histórico:** `exportHistory("json" | "csv")`

---

## Estendendo ou Modificando o Serviço

- A interface `HistoryService` está em `src/core/infrastructure/electron/history-service.ts`.
- Para adicionar funcionalidades (ex: favoritos, tags):
  - Expanda o schema em `src/core/infrastructure/db/schema.ts`.
  - Atualize a interface e implementação do serviço.
  - Exponha novos métodos via preload (`preload.ts`) e tipagem (`electronAPI.d.ts`).
  - Atualize o hook `useHistory` conforme necessário.

**Dica:** mantenha a interface clara e métodos assíncronos.

---

## Exportando Dados

- Use `exportHistory("json")` para obter um JSON completo com conversas e mensagens.
- Use `exportHistory("csv")` para CSVs separados por seção.
- O resultado pode ser salvo localmente ou enviado para backend.

---

## Boas Práticas

- **Não acesse SQLite diretamente no frontend.** Use sempre a API via preload.
- **Gerencie erros e loading** usando o hook, para melhor UX.
- **Mantenha o serviço desacoplado** da UI, facilitando testes e manutenção.
- **Prefira funções pequenas e coesas** ao estender funcionalidades.
- **Documente alterações** criando novos ADRs quando necessário.
- **Faça backup/exportação periódica** para evitar perda de dados.

---

## Referências

- [ADR-0010 - Histórico com SQLite + Drizzle](./adr/ADR-0010-Historico-Conversas-SQLite-Drizzle.md)
- [Drizzle ORM](https://orm.drizzle.team)
- [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)