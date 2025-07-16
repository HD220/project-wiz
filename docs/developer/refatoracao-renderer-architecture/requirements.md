# Refatoração e Reorganização do Renderer - Requisitos

## Visão Geral

Esta documentação define os requisitos para a refatoração completa do renderer, aplicando princípios de Clean Code, Object Calisthenics e reorganização arquitetural para alinhar com os domínios do main process.

## Contexto do Projeto

O Project Wiz possui uma arquitetura simplificada baseada em domínios no main process (`projects`, `agents`, `users`, `llm`) já implementada e funcionando. O renderer ainda mantém a estrutura de features antiga com violações significativas de Object Calisthenics e duplicação de código, precisando ser migrado para alinhar com a nova arquitetura.

## Objetivos da Refatoração

### Objetivos Primários

1. **Aplicar Object Calisthenics** em todo o código do renderer
2. **Reorganizar estrutura** para alinhar com domínios do main process
3. **Simplificar stores** aplicando padrão Zustand slim + TanStack Query
4. **Decompor componentes monolíticos** em micro-componentes focados
5. **Padronizar comunicação IPC** usando APIs tipadas
6. **Maximizar reaproveitamento** de código e componentes

### Objetivos Secundários

1. **Melhorar performance** através de otimizações de TanStack Router
2. **Reduzir bundle size** via code splitting por domínio
3. **Facilitar manutenção** com código mais limpo e organizado
4. **Acelerar desenvolvimento** com padrões consistentes

## Escopo da Refatoração

### Incluído no Escopo

**Estrutura de Arquivos:**

- Reorganização completa de `src/renderer/features/` → `src/renderer/domains/`
- Migração de todos os 93 arquivos identificados
- Criação de nova estrutura `src/renderer/shared/`
- Reorganização de rotas seguindo domínios

**Código-fonte:**

- Refatoração de 15 arquivos críticos violando Object Calisthenics (>200 linhas)
- Decomposição de 23 arquivos moderados (100-200 linhas)
- Migração de 45 arquivos simples (<100 linhas)
- Reorganização de 56 arquivos de manutenção (rotas, tipos, config)
- Aplicação de Clean Code em todos os 139 arquivos identificados

**Integração IPC:**

- Unificação para API tipada (`window.electronIPC.domain.method()`)
- Eliminação de padrões legacy (`window.electronIPC.invoke()`)
- Padronização de error handling
- Implementação de validação de entrada

**Padrões Arquiteturais:**

- Implementação de Object Calisthenics completa
- Padrão Zustand slim + TanStack Query
- Decomposição em micro-componentes
- Hooks single-purpose

### Excluído do Escopo

**Funcionalidades:**

- Alteração de funcionalidades existentes
- Adição de novas features
- Modificação de fluxos de usuário
- Alteração de interfaces visuais
- Modificação da arquitetura do main process (já implementada)

**Testes:**

- Criação de novos testes durante refatoração
- Modificação de testes existentes
- Implementação de test coverage

**Backend:**

- Alteração do main process (já migrado)
- Modificação de handlers IPC (já organizados por domínio)
- Mudança de schemas de banco (já implementados)
- Alteração de estrutura de domínios (já funcionando)

## Requisitos Funcionais

### RF01 - Reorganização por Domínios

**Descrição:** Reorganizar toda a estrutura de features para alinhar com os domínios do main process.

**Critérios de Aceite:**

- Features reorganizadas: `agent-management/` → `agents/`, `project-management/` → `projects/`, etc.
- Alinhamento 100% com `src/main/domains/`
- Eliminação de features híbridas (`channel-messaging/`, `communication/`)
- Estrutura nova `src/renderer/domains/` implementada

**Prioridade:** Alta

### RF02 - Object Calisthenics Compliance

**Descrição:** Aplicar rigorosamente os princípios de Object Calisthenics em todo o código.

**Critérios de Aceite:**

- Máximo 50 linhas por classe/componente
- Máximo 10 linhas por método/função
- Máximo 2 variáveis de instância por classe
- Eliminação de statements `else`
- Primitivos encapsulados em Value Objects quando apropriado

**Prioridade:** Alta

### RF03 - Simplificação de Stores

**Descrição:** Refatorar stores monolíticos para padrão Zustand slim + TanStack Query.

**Critérios de Aceite:**

- Stores reduzidos a ≤50 linhas
- Separação clara: Zustand para estado local, TanStack Query para backend
- Eliminação de lógica de negócio em stores
- Hooks especializados para cada responsabilidade

**Prioridade:** Alta

### RF04 - Decomposição de Componentes

**Descrição:** Quebrar componentes monolíticos em micro-componentes focados.

**Critérios de Aceite:**

- Componentes ≤50 linhas
- Responsabilidade única por componente
- Lógica extraída para hooks customizados
- Padrão Container/Presentation aplicado

**Prioridade:** Média

### RF05 - Padronização IPC

**Descrição:** Unificar comunicação IPC para API tipada consistente.

**Critérios de Aceite:**

- 100% dos calls usando `window.electronIPC.domain.method()`
- Eliminação de `window.electronIPC.invoke()` legacy
- Error handling padronizado
- Validação de entrada implementada

**Prioridade:** Média

### RF06 - Reorganização de Rotas

**Descrição:** Reorganizar rotas seguindo estrutura de domínios com preload otimizado.

**Critérios de Aceite:**

- Rotas organizadas por domínio
- Preload implementado em rotas críticas
- Eliminação de layouts redundantes
- Code splitting por domínio

**Prioridade:** Baixa

## Requisitos Não Funcionais

### RNF01 - Performance

**Descrição:** Manter ou melhorar a performance atual da aplicação.

**Critérios de Aceite:**

- Tempo de carregamento inicial ≤ estado atual
- Navegação entre rotas ≤ estado atual
- Memory usage ≤ estado atual
- Bundle size reduzido via code splitting

**Prioridade:** Alta

### RNF02 - Compatibilidade

**Descrição:** Manter 100% compatibilidade com funcionalidades existentes.

**Critérios de Aceite:**

- Todos os fluxos de usuário funcionando
- Integração IPC mantida
- Dados persistidos corretamente
- Nenhuma funcionalidade removida

**Prioridade:** Alta

### RNF03 - Manutenibilidade

**Descrição:** Melhorar significativamente a manutenibilidade do código.

**Critérios de Aceite:**

- Código autodocumentado
- Padrões consistentes aplicados
- Estrutura intuitiva para novos desenvolvedores
- Duplicação de código ≤ 5%

**Prioridade:** Média

### RNF04 - Type Safety

**Descrição:** Manter type safety completa durante toda a refatoração.

**Critérios de Aceite:**

- Zero erros de TypeScript
- Tipos compartilhados utilizados corretamente
- Validação de tipos em tempo de compilação
- IntelliSense funcionando perfeitamente

**Prioridade:** Alta

## Dependências

### Dependências Internas

**Arquitetura Main Process:**

- `src/main/domains/` deve estar estabilizada
- Handlers IPC funcionando corretamente
- Tipos compartilhados em `src/shared/types/` atualizados

**Infraestrutura:**

- TanStack Router configurado
- Zustand implementado
- Radix-UI/shadcn funcionando
- Electron IPC estável

### Dependências Externas

**Bibliotecas Principais:**

- `@tanstack/react-query` para cache e sincronização
- `@tanstack/react-router` para roteamento
- `zustand` para estado global
- `zod` para validação de esquemas
- `react-hook-form` para formulários

**Ferramentas de Desenvolvimento:**

- `TypeScript` para tipagem estática
- `ESLint` para linting
- `Prettier` para formatação
- `Vite` para build

## Riscos e Mitigações

### Riscos de Alto Impacto

**R01 - Quebra de Funcionalidades**

- **Impacto:** Alto
- **Probabilidade:** Baixa (backend já migrado)
- **Mitigação:** Migração arquivo por arquivo com validação contínua

**R02 - Problemas de Performance**

- **Impacto:** Médio
- **Probabilidade:** Baixa
- **Mitigação:** Monitoramento durante refatoração, benchmarks

**R03 - Complexidade de Integração IPC**

- **Impacto:** Baixo
- **Probabilidade:** Muito Baixa
- **Mitigação:** Handlers IPC já organizados por domínio e funcionando

### Riscos de Médio Impacto

**R04 - Regressões de UI**

- **Impacto:** Médio
- **Probabilidade:** Baixa
- **Mitigação:** Testes manuais durante migração

**R05 - Incompatibilidade de Tipos**

- **Impacto:** Baixo
- **Probabilidade:** Baixa
- **Mitigação:** Tipos compartilhados já estão bem definidos

## Critérios de Sucesso

### Critérios Técnicos

**Qualidade de Código:**

- ✅ 100% compliance com Object Calisthenics
- ✅ Zero violações de ESLint
- ✅ Zero erros de TypeScript
- ✅ Duplicação de código ≤ 5%

**Estrutura Arquitetural:**

- ✅ Alinhamento 100% com domínios do main process
- ✅ Stores ≤ 50 linhas cada
- ✅ Componentes ≤ 50 linhas cada
- ✅ Hooks single-purpose implementados

**Performance:**

- ✅ Tempo de carregamento mantido ou melhorado
- ✅ Bundle size reduzido via code splitting
- ✅ Memory usage otimizado

### Critérios Funcionais

**Funcionalidades:**

- ✅ Todos os fluxos de usuário funcionando
- ✅ Integração IPC 100% funcional
- ✅ Dados persistidos corretamente
- ✅ UI/UX idênticos ao estado atual

**Manutenibilidade:**

- ✅ Código autodocumentado
- ✅ Padrões consistentes aplicados
- ✅ Estrutura intuitiva para novos desenvolvedores
- ✅ Facilidade para adicionar novas features

## Considerações Especiais

### Migração Incremental

**Estratégia:** Migração arquivo por arquivo para minimizar riscos
**Validação:** Testes manuais após cada migração
**Rollback:** Possibilidade de reverter migração específica

### Compatibilidade Backward

**Mantida Durante:** Período de migração
**Eliminada Após:** Migração 100% concluída
**Impacto:** Nenhum para usuários finais

### Documentação

**Atualização:** CLAUDE.md atualizado com nova estrutura
**Guias:** Implementation guide detalhado
**Exemplos:** Code snippets para novos padrões

## Aprovação

Esta documentação deve ser aprovada pela equipe antes do início da implementação, garantindo alinhamento com os objetivos do projeto e recursos disponíveis.
