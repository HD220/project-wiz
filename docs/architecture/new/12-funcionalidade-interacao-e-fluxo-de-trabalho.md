# 12. Funcionalidade: Interação e Fluxo de Trabalho

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17  

---

## 🎯 Visão da Funcionalidade

Este módulo descreve o coração da interação do usuário com o sistema: o fluxo de trabalho conversacional. O objetivo é permitir que o usuário delegue trabalho de forma natural, como se estivesse conversando com uma equipe humana, e monitore o progresso de forma passiva, sem a necessidade de microgerenciamento.

---

## 1. Iniciação de Tarefas Conversacional

A principal forma de iniciar trabalho no Project Wiz é através do chat.

### Implementação Técnica

-   **Backend**: Este fluxo envolve múltiplos Bounded Contexts.
    1.  **`conversations`**: O `MessageService` recebe a mensagem do usuário.
    2.  **`conversations/routing`**: O `MessageRouter` usa o `LLMService` para analisar a intenção da mensagem.
    3.  **`agents/queue`**: Se a intenção for uma tarefa, o `MessageRouter` cria um `Job` (uma tarefa interna) e o envia para o `QueueService`.
    4.  **`agents/worker`**: O `QueueService` atribui o Job à fila da Persona mais qualificada, e o `AgentWorker` o executa.
-   **Frontend**: A interação ocorre no componente `chat-input.tsx` dentro de um canal de projeto.

### Exemplo de Fluxo

1.  **Usuário digita no chat**: `"@frontend-dev, por favor, crie um componente de botão primário seguindo nosso design system."`
2.  **Análise de Intenção**: O `MessageRouter` identifica que esta é uma solicitação de `code_implementation` e que o alvo é o agente `frontend-dev`.
3.  **Criação do Job**: Um Job é criado com a descrição da tarefa.
4.  **Enfileiramento**: O Job é colocado na fila específica do agente `frontend-dev`.
5.  **Feedback ao Usuário**: O agente `frontend-dev` posta uma mensagem de confirmação no chat: `"Entendido. Começando a criação do componente de botão primário."`

---

## 2. Painel de Atividades (Monitoramento de Jobs)

Embora o usuário não gerencie ativamente as tarefas, ele pode monitorar o progresso delas.

### Implementação Técnica

-   **Backend**: O `AgentService` e o `JobService` (dentro do agregado `agents/worker`) atualizam o status de um Job (`Na Fila`, `Em Execução`, `Concluído`, `Falhou`) no banco de dados à medida que ele progride.
-   **Frontend**: Uma rota, como `@/renderer/app/project/[project-id]/activity/`, pode ser criada para exibir o painel.
    -   Um hook `use-jobs.ts` buscaria a lista de Jobs e seus status para o projeto.
    -   A UI seria uma visualização somente leitura, mostrando o agente responsável, a descrição da tarefa e o status atual.

---

## 3. Intervenção de Exceção

Em casos raros, o usuário pode precisar intervir em um Job em andamento.

### Implementação Técnica

-   **Backend**: O `JobService` exporia métodos através de handlers IPC para pausar ou cancelar um Job. Essas ações alterariam o estado do Job no banco de dados e sinalizariam ao `AgentWorker` para interromper a execução.
-   **Frontend**: No painel de atividades, cada Job em execução teria botões de "Pausar" ou "Cancelar".
    -   Esses botões chamariam as funções correspondentes da API IPC, como `window.api.jobs.cancel(jobId)`.
