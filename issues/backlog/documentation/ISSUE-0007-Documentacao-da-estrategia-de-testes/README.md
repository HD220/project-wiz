# Documentação da estratégia de testes

## Descrição

Documentação abrangente da estratégia de testes do projeto, incluindo:

- Tipos de testes e coberturas mínimas
- Ferramentas e exemplos
- Critérios de aceitação

## Histórico de Implementação

### 02/04/2025 - Implementação de Novos Handlers IPC

**Testes de Integração Adicionados:**

- Implementados novos handlers IPC para "download-model" e "send-prompt"
- Adicionados testes de integração correspondentes em `src/core/__tests__/integration/worker.integration.test.ts`
- Documentação atualizada em `docs/testing-strategy.md`

**Impacto:**

- Nova funcionalidade de download de modelos remotos
- Suporte a envio assíncrono de prompts
- Melhoria na cobertura de testes

### 02/04/2025 - Padronização dos Handlers IPC

**Mudanças nos Testes:**

- Todos os handlers do WorkerService foram padronizados para receber e repassar payloads idênticos aos do worker
- Testes de integração atualizados para refletir a nova padronização

**Impacto:**

- Melhoria na consistência da API
- Facilita a manutenção e extensão futura
- Documentação atualizada em `docs/testing-strategy.md`
- Monitoramento contínuo

## Conteúdo Atual

```markdown
# Estratégia de Testes - Project Wiz

## Tipos de Testes

1. **Testes Unitários** (Cobertura mínima: 80%)

   - Componentes UI individuais
   - Funções utilitárias
   - Lógica de negócios pura
   - Ferramentas: Jest + Testing Library

2. **Testes de Integração** (Cobertura mínima: 70%)

   - Comunicação entre componentes
   - Integração UI-Serviços
   - Comunicação IPC
   - Ferramentas: Jest + MSW

3. **Testes de Sistema (e2e)** (Cobertura mínima: 50%)
   - Fluxos completos com LLMs
   - Performance básica
   - Ferramentas: Playwright

## Critérios de Aceitação

- Cobertura mínima atingida
- Performance dentro dos limites
- 0 regressões críticas por release
- 100% dos testes passando no CI
```

## Tarefas

- [ ] Revisar documentação atual
- [ ] Atualizar ferramentas e coberturas
- [ ] Verificar exemplos de código
- [ ] Atualizar critérios de aceitação

## Critérios de Aceitação

- Documentação completa da estratégia de testes
- Ferramentas e coberturas atualizadas
- Exemplos de código verificados
- Critérios claros e mensuráveis
