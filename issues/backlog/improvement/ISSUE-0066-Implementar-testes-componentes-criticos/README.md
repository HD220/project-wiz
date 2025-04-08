# Implementar testes para componentes críticos

## Descrição

Esta issue visa implementar testes unitários e de integração para os componentes e serviços críticos do projeto que ainda não possuem cobertura adequada, seguindo a estratégia de testes definida.

## Contexto

- A estratégia de testes define uso de Jest + Testing Library
- Cobertura mínima alvo de 90% para componentes críticos
- Testes devem incluir casos de uso reais e edge cases
- Configuração atual do Jest já suporta os testes necessários

## Componentes/Serviços Prioritários

1. **Core Services:**
   - `WorkerService` (src/core/services/)
   - `LLMService` (src/core/services/llm/)
   - Eventos IPC (src/core/events/bridge.ts)

2. **Hooks críticos:**
   - `useLLM` (src/client/hooks/use-llm.ts)
   - `useMobile` (src/client/hooks/use-mobile.ts)

3. **Utils essenciais:**
   - Funções principais em `src/client/lib/utils.ts`

## Tipos de Testes

Para cada componente/serviço:

1. **Testes unitários básicos**
   - Funcionalidades principais
   - Retornos esperados
   - Tratamento de erros

2. **Testes de integração**
   - Comunicação entre serviços
   - Fluxos completos
   - Mock de dependências externas

3. **Testes de comportamento**
   - Estados assíncronos
   - Side effects
   - Resiliência a falhas

## Critérios de Aceitação

- [ ] 90%+ de cobertura para serviços/hooks críticos
- [ ] Testes de integração para fluxos principais
- [ ] Testes de tratamento de erros para todos os casos
- [ ] Mock adequado de dependências externas
- [ ] Pipeline CI executando os novos testes

## Tasks

1. [ ] Implementar testes para WorkerService
2. [ ] Implementar testes para LLMService
3. [ ] Implementar testes para bridge IPC
4. [ ] Implementar testes para hook useLLM
5. [ ] Implementar testes para utils críticas
6. [ ] Adicionar testes de tratamento de erros
7. [ ] Atualizar documentação de testes

## Referências

- [Estratégia de Testes](/docs/testing-strategy.md)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Testing Library Docs](https://testing-library.com/docs/)