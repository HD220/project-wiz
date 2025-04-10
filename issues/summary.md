- **ISSUE-0087-Gerenciamento-de-tokens-de-compartilhamento-Personalizacao-Prompts**: pendente
- **ISSUE-0088-Alertas-dados-sensiveis-Personalizacao-Prompts**: pendente
# Resumo das Issues - Branch "fase2"

## Issues concluídas nesta etapa

### Documentação
- **ISSUE-0013 - Completar documentação de arquitetura**
  - Documentação expandida, diagramas atualizados, integração com ADRs, revisada e movida para `completed/documentation/`

### Features
- **ISSUE-0021 - App mobile de acompanhamento**
  - API HTTP criada no Electron
  - App React Native com pareamento via QR code (simulado)
  - Comunicação segura via token
  - Primeira entrega funcional concluída e movida para `completed/feature/`

### Bugs
- **ISSUE-0095 - Corrigir risco de vazamento de memória no LlmService**
  - Status: **concluída em 10/04/2025**
  - O risco de vazamento de memória no `LlmService` foi eliminado com sucesso após análise e correção.
- **ISSUE-0097 - Timeouts e limpeza automática LlmService**
  - Status: **concluída em 10/04/2025**
  - Timeouts e limpeza automática no `LlmService` foram implementados com sucesso.
- **ISSUE-0148-Remover-dados-fixos-do-dashboard-e-paginas** (pendente)
- **ISSUE-0150-Refatorar-integracoes-mobile-criptografia-e-tratamento-de-erros** (pendente)

### Melhorias concluídas
- **ISSUE-0092 - Refatorar componente ActivityLog**
  - Componente monolítico (~140 linhas) foi modularizado em múltiplos subcomponentes.
  - Lógica de filtragem, exportação e formatação extraída para hook `useActivityLog`.
  - Estrutura segmentada melhora legibilidade, manutenção e testabilidade.
  - Status: **completed**

- **ISSUE-0053 - Melhorar Acessibilidade ARIA**
  - Atributos ARIA aplicados, navegação por teclado e contraste ajustados conforme WCAG.
  - **Testes automatizados ainda não implementados** (recomendado criar nova issue para isso).
  - Status: **completed**
- **ISSUE-0065 - Refatorar RepositorySettings**
  - Status: **completed**

- **ISSUE-0091 - Refatorar componente RepositorySettings (2ª etapa)**
  - Refatoração complementar concluída.
  - Componente reduzido para ~80 linhas.
  - Lógica extraída para hook `useRepositorySettings`.
  - UI segmentada em subcomponentes (`RepositoryCard`, `RepositoryConfigForm`, `AccessTokenForm`, `AddRepositoryButton`).
  - Código modular, limpo e testável.
  - Status: **completed**
  - Componente modularizado, dividido em subcomponentes (`RepositoryCard`, `RepositoryConfigForm`, `AccessTokenForm`, `AddRepositoryButton`, `Tabs`).
  - Código simplificado, legível e aderente a Clean Architecture.
  - **Testes unitários ainda pendentes.**
  - Status: **completed**
- **ISSUE-0075 - Aprimorar tratamento de erros e retries IPC**
  - Implementado retries automáticos com timeout configurável e tratamento detalhado de erros na comunicação IPC.
- **ISSUE-0089 - Refatorar componente Dashboard**
  - Componente modularizado, simplificado e dividido em subcomponentes.
  - Lógica extraída para hooks e componentes especializados.
  - Código limpo, legível e aderente a Clean Architecture.
  - Status: **completed**
- **ISSUE-0090 - Refatorar componente Documentation**
  - Componente reduzido de ~400 para ~75 linhas, focado apenas na renderização.
  - Lógica de carregamento, filtragem e formatação extraída para hook `useDocumentation`.
  - Uso de subcomponentes (`Input`, `Card`, `FileList`) para segmentar UI.
  - Separação de responsabilidades alcançada, facilitando manutenção.
  - Status: **completed**
- **ISSUE-0093 - Refatorar componente ModelActions**
  - Componente segmentado em `ActivateButton`, `DownloadButton` e `DownloadIcon`.
  - Renderização condicional simplificada.
  - Código modular, limpo e fácil de manter.
  - Status: **completed**
- **ISSUE-0094 - Extrair persistência do tema para serviço externo**
  - Serviço `theme-storage.ts` criado para encapsular persistência no `localStorage`.
  - `ThemeProvider` refatorado para usar o serviço, eliminando acesso direto ao `localStorage`.
  - Alinhado com Clean Architecture, facilitando testes e manutenção.
  - Status: **completed**

## Features pendentes no backlog

As seguintes features foram revisadas e permanecem **pendentes**, aguardando implementação:

- **ISSUE-0015 - Refatorar sidebar** (pendente)
- **ISSUE-0024 - Implementar sistema de autenticação** (pendente)
- **ISSUE-0035 - Implementar visualização de métricas LLM** (pendente)
- **ISSUE-0037 - Melhorar integração com Git** (pendente)
- **ISSUE-0038 - Implementar controle de sessões LLM** (pendente)
- **ISSUE-0039 - Implementar configurações avançadas LLM** (pendente)
- **ISSUE-0042 - Implementar fila de prompts** (pendente)
- **ISSUE-0044 - Implementar métricas de uso de GPU** (pendente)
- **ISSUE-0046 - Implementar retry automático useLLM** (pendente)
- **ISSUE-0047 - Implementar streaming de respostas** (pendente)
- **ISSUE-0048 - Implementar streaming useLLM** (pendente)
- **ISSUE-0049 - Implementar streaming WorkerService** (pendente)
- **ISSUE-0050 - Implementar indicador de carregamento LLM** (pendente)
- **ISSUE-0051 - Implementar cancelamento requisições LLM** (pendente)
- **ISSUE-0054 - Implementar temas customizáveis** (pendente)
- **ISSUE-0055 - Implementar internacionalização completa** (pendente)
- **ISSUE-0056 - i18n model settings description** (pendente)
- **ISSUE-0057 - i18n model list description** (pendente)
- **ISSUE-0058 - i18n model list model list description** (pendente)
- **ISSUE-0059 - i18n sidebar tooltip** (pendente)
- **ISSUE-0060 - i18n chart children** (pendente)
- **ISSUE-0061 - i18n theme provider children** (pendente)
- **ISSUE-0062 - Implementar sistema de notificação** (pendente)
- **ISSUE-0063 - Implementar sistema de ajuda/tutorial** (pendente)
- **ISSUE-0069 - Refatorar comunicação IPC** (completed)
- **ISSUE-0070 - Completar implementação ModelManager** (pendente)
- **ISSUE-0071 - Implementar importação histórico conversas** (pendente)
- **ISSUE-0072 - Implementar backup e restauração histórico** (pendente)
- **ISSUE-0107 - Implementar análise e visualização histórico** (pendente)
- **ISSUE-0151-Implementar-React-Navigation-no-app-mobile** (pendente)

### Documentação pendente

- **ISSUE-0130 - Documentar build/deploy Electron** (pendente)
- **ISSUE-0145-Documentar-entidades-value-objects-use-cases** (pendente)

### Melhorias pendentes no backlog

- **ISSUE-0080 - Correção conversão tipos frontend Personalização Prompts** (pendente)
  - Conversão de strings para boolean, number, date **não implementada**.
  - Persistência força todos os tipos para string, causando risco de inconsistência.
  - Validações e feedback para inputs inválidos ausentes.
  - Atualização e criação sobrescrevem tipos para string, gerando perda de informação.

- **ISSUE-0078 - Monitorar e otimizar performance LLM** (pendente)

- **ISSUE-0081 - Substituir checksum por assinatura digital Personalização Prompts** (pendente)
- **ISSUE-0086 - Controle multi-tenant e permissões - Personalização de Prompts** (pendente)
  - Não há isolamento multi-tenant implementado.
  - Não há controle de permissões CRUD ou visibilidade por usuário ou organização.
  - Backend e frontend não possuem segregação ou checagem de permissões.

  - Atual mecanismo baseado em checksum simples ainda ativo.
  - Assinatura digital (ex: HMAC-SHA256) para garantir autenticidade **não implementada**.
  - Risco: arquivos adulterados podem passar despercebidos.

- **ISSUE-0082 - Centralizar validações no SettingsService - Personalização de Prompts** (pendente)
  - Validações continuam dispersas em múltiplas classes (`PromptPolicyService`, `PromptValidator`).
  - `SettingsService` apenas fornece configurações, sem executar validações.
  - Centralização ainda não realizada.

- **ISSUE-0079 - Reforçar sanitização backend/frontend Personalização Prompts** (pendente)
  - Sanitização profunda contra XSS, scripts, HTML e injeções **não implementada**.
  - Frontend aceita qualquer conteúdo sem limpeza.
  - Backend valida apenas tamanho, palavras proibidas e tipos, sem sanitização reforçada.
- **ISSUE-0083 - Confirmação e preview na importação Personalização Prompts** (pendente)
  - Atualmente a importação ocorre sem confirmação ou visualização prévia.
  - Modal de confirmação e preview detalhado **não implementados**.
  - Risco de sobrescrita acidental permanece.

  - Risco de dados maliciosos persistirem e afetarem outras partes do sistema.
  - Hooks e UI preparados para exibir métricas.
  - Backend ainda retorna métricas mockadas (`WorkerServiceAdapter.getMetrics`).
  - Coleta real de métricas detalhadas e otimizações de performance **não implementadas**.


- **ISSUE-0068 - Consolidação dos Serviços LLM** (pendente)
- **ISSUE-0071 - Atualização de Nomenclatura dos Serviços LLM** (pendente)
- **ISSUE-0074 - Melhorar cancelamento e listeners** (pendente)
- **ISSUE-0077 - Refinar UI do streaming incremental** (pendente)
  - Cancelamento e limpeza de listeners implementados apenas no `MistralGGUFAdapter`.
  - Demais serviços/gateways LLM ainda não suportam cancelamento.
  - Recomendado estender a melhoria para todos os fluxos LLM para evitar vazamentos e garantir estabilidade.

- **ISSUE-0027 - Implementar sistema de logging centralizado** (pendente)
- **ISSUE-0040 - Implementar sistema de logging centralizado** (pendente)

- **ISSUE-0017 - Atualizar Electron e dependências** (pendente)
- **ISSUE-0019 - Adicionar Husky e lint-staged** (pendente)
- **ISSUE-0018 - Melhorar main process do Electron** (pendente)
  - DevTools condicional, tratamento de erros, graceful shutdown e logs ainda não implementados
  - Electron parcialmente atualizado, mas resolução ainda força versão antiga (^34.0.2)
  - @testing-library/react não atualizado ou removido
  - Outras dependências em geral atualizadas
  - Necessário revisar resolução do Electron e dependências de testes

- **ISSUE-0123 - Testes automatizados acessibilidade ARIA** (pendente)
- **ISSUE-0124 - Coletar métricas reais LLM WorkerServiceAdapter** (pendente)
- **ISSUE-0131 - Testes automatizados componentes refatorados** (pendente)
- **ISSUE-0141-Refatorar-tipos-dominio-para-domain-contracts** (pendente)
- **ISSUE-0142-Padronizar-nomenclatura-ingles-backend** (pendente)
- **ISSUE-0143-Extrair-import-export-prompts-para-servicos-dedicados** (pendente)
- **ISSUE-0144-Reforcar-testes-unitarios-backend** (pendente)
- **ISSUE-0146-Refatorar-Sidebar-em-componentes-menores** (pendente)
- **ISSUE-0147-Refatorar-hooks-complexos-e-duplicados** (pendente)
- **ISSUE-0149-Melhorar-acessibilidade-frontend-e-mobile** (pendente)

### Segurança pendente

- **ISSUE-0140-Adicionar-validacoes-infraestrutura** (pendente)

## Status geral

- Todas as issues em andamento na branch `"fase2"` foram concluídas e movidas para `issues/completed/`, exceto bugs pendentes.
- Nenhuma issue pendente em `issues/working/`
- Próximas etapas: revisar backlog e planejar novas entregas

- [ ] ISSUE-0084-Adicionar-campo-description-Personalizacao-Prompts (improvement) - pendente
- **ISSUE-0085 - Histórico de versões e rollback - Personalização de Prompts** (pendente)
  - Não implementado versionamento histórico persistente.
  - Não há API para listar versões antigas nem rollback granular.
  - Apenas controle incremental simples no campo `version`, sobrescrevendo o registro.
  - UI para histórico e restauração de versões específicas **não existente**.
