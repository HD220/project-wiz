# Tarefa: FE-IPC-ONBOARD - Definir e implementar IPCs para o fluxo de Onboarding.

**ID da Tarefa:** `FE-IPC-ONBOARD`
**Título Breve:** Definir e implementar IPCs para o fluxo de Onboarding.
**Descrição Completa:**
Definir e implementar os canais de comunicação entre processos (IPC) e os handlers no backend necessários para o fluxo de onboarding. Isso inclui queries para buscar dados existentes (se houver, como provedores LLM) e casos de uso para criar novas entidades (usuário, configuração LLM).

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-IPC-CORE-ABSTR` (Camada de abstração IPC no frontend), (Backend) Definição dos serviços/repositórios/casos de uso para usuário e configuração LLM.
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P0` (Essencial para o onboarding)
**Responsável:** `Frontend` (para as chamadas) e `Backend` (para os handlers)
**Branch Git Proposta:** `feat/fe-ipc-onboarding`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Canais IPC definidos em `shared/ipc-types.ts` para:
    - `query:get-user` (ou similar, para verificar se o usuário já existe)
    - `query:get-llm-providers` (para listar provedores LLM disponíveis)
    - `usecase:create-user`
    - `usecase:create-llm-provider-config`
- Handlers IPC implementados no processo principal do Electron para cada um dos canais acima, invocando os serviços/casos de uso apropriados no backend.
- A camada de abstração `useCore()` no frontend expõe funções para chamar esses IPCs.
- Tipagem para requisições e respostas de cada IPC definida.

---

## Notas/Decisões de Design
- Agrupado para onboarding. (Nota original da tarefa)
- A lógica exata dos casos de uso do backend (ex: o que acontece se o usuário já existir durante `create-user`) é definida no backend.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
