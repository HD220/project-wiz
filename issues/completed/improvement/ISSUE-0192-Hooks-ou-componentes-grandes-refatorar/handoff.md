# Handoff – ISSUE-0192 – Hooks ou componentes grandes devem ser refatorados

**Data:** 2025-04-12  
**Responsável:** Roo (Code mode)  
**Ação:** Refatoração do hook `useAuth`  
**Justificativa:** O hook `useAuth` possuía 155 linhas, centralizando múltiplas responsabilidades e dificultando manutenção, testes e legibilidade. Para atender ao Clean Code e às regras do projeto, foram extraídas funções utilitárias de manipulação de tokens para `auth-storage.ts` e funções de requisição à API para `auth-api.ts`. O hook foi reescrito para orquestrar apenas o estado e as chamadas, tornando-se mais modular, testável e de fácil manutenção. Não houve necessidade de atualizar imports em outros arquivos, pois não foram encontradas dependências externas diretas.

**Resumo das alterações:**
- Criação de `src/client/hooks/auth-storage.ts` para helpers de tokens e tipos.
- Criação de `src/client/hooks/auth-api.ts` para funções de requisição à API.
- Refatoração de `src/client/hooks/use-auth.ts` para utilizar os utilitários extraídos.
- Manutenção dos contratos e nomes em inglês, conforme SDR-0001.
- Nenhuma dependência externa afetada.

**Próximo passo:** Mover a issue para `issues/completed/improvement/` conforme o fluxo do projeto.