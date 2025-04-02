# Estratégia de Testes - Project Wiz

## Visão Geral

Esta estratégia define a abordagem de testes para o Project Wiz, alinhada com os princípios de Clean Architecture e considerando as particularidades de integração com LLMs.

## Objetivos

- Garantir qualidade e estabilidade
- Manter baixa complexidade
- Cobrir todas as camadas da arquitetura
- Monitorar performance de LLMs
- Facilitar manutenção

## Tipos de Testes

### 1. Testes Unitários

**Cobertura mínima: 80%**

- Foco em componentes isolados
- Testar:
  - Componentes UI individuais
  - Hooks customizados
  - Funções utilitárias
  - Lógica de negócios pura

**Ferramentas:**

- Jest + Testing Library
- Mock de dependências externas

### 2. Testes de Integração

**Cobertura mínima: 70%**

- Testar:
  - Comunicação entre componentes
  - Integração UI-Serviços
  - Comunicação IPC
  - Fluxos completos sem LLMs

**Ferramentas:**

- Jest + Testing Library
- MSW para mock de APIs

### 3. Testes de Sistema (e2e)

**Cobertura mínima: 50%**

- Testar:
  - Fluxos completos com LLMs
  - Performance básica
  - Comportamento em diferentes plataformas

**Ferramentas:**

- Playwright (para Electron)
- Benchmark.js (para performance)

### 4. Testes de Performance

- Monitorar:
  - Tempo de resposta de LLMs
  - Uso de memória
  - Temperatura da CPU

**Ferramentas:**

- Node.js perf_hooks
- Electron performance monitor

## Estratégia por Camada

### Camada de UI (React/Electron)

- Testes unitários: componentes isolados
- Testes de integração: fluxos UI
- Snapshot testing para componentes críticos
- Testes de acessibilidade

### Camada de Serviços

- Testes unitários: funções puras
- Testes de integração: comunicação IPC
- Mock de LLMs para testes determinísticos

### Camada de Modelos (LLMs)

- Testes de integração leve
- Testes de performance
- Testes de compatibilidade

## Critérios de Aceitação

1. **Cobertura mínima** atingida em todas as camadas
2. **Performance** dentro dos limites estabelecidos:
   - Tempo de resposta < 2s para prompts simples
   - Uso de memória < 1GB para modelos médios
3. **Estabilidade**:
   - 0 regressões críticas por release
   - 100% dos testes passando no CI
4. **Manutenibilidade**:
   - Tempo médio para adicionar novos testes < 30min
   - Tempo de execução total < 10min

## Implementação Progressiva

1. **Fase 1 (1 mês)**:

   - Cobrir componentes críticos
   - Implementar pipeline CI básico
   - Testes unitários para serviços principais

2. **Fase 2 (2 meses)**:

   - Expandir para componentes não críticos
   - Adicionar testes de integração
   - Implementar monitoramento de performance

3. **Fase 3 (3 meses)**:
   - Testes e2e completos
   - Otimização de performance
   - Relatórios automatizados

## Monitoramento Contínuo

- Relatórios de cobertura
- Alertas de regressão
- Monitoramento de performance em produção
- Revisão trimestral da estratégia

## Próximos Passos

1. Priorizar componentes para testes
2. Definir métricas de performance específicas
3. Configurar ambiente de CI/CD
4. Treinar equipe nos padrões de teste
