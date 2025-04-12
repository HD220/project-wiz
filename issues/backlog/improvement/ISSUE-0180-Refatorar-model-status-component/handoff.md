## Progresso da Refatoração do ModelStatus

### Decisões e Justificativas

- **Dados hardcoded removidos:** O componente `ModelStatus` agora recebe todos os dados via props, eliminando qualquer dado fixo/hardcoded.
- **Separação de responsabilidades (SRP):** Toda a lógica de obtenção de dados foi extraída para um novo hook (`useModelStatus`), tornando o componente puramente de apresentação.
- **Desacoplamento de domínio na UI:** O componente não acessa mais hooks ou contexto diretamente, alinhando-se à Clean Architecture e facilitando testes.
- **Preparação para i18n:** Todos os textos do componente foram adaptados para internacionalização usando `@lingui/macro`.
- **Testabilidade e extensibilidade:** O componente pode ser facilmente testado com diferentes cenários de props e pode ser reutilizado em outros contextos.

### Implementação

1. **Criação do hook `useModelStatus`**
   - Local: `src/client/hooks/use-model-status.ts`
   - Responsável por compor os dados de status do modelo a partir de outros hooks (`useAvailableModels`, `useGpuMetrics`).
   - Recebe `modelId` como argumento para maior flexibilidade e alinhamento com Clean Architecture.

2. **Refatoração do componente `ModelStatus`**
   - Local: `src/client/components/model-status.tsx`
   - Agora recebe via props: `modelName`, `memoryUsagePercent`, `memoryUsed`, `memoryTotal`, `loading`, `error`.
   - Não possui mais lógica de obtenção de dados.
   - Textos preparados para i18n.

### Próximos Passos

- Adaptar o componente pai para obter o `modelId` (via `useModelConfiguration` ou contexto) e passar para o hook e para o componente.
- Garantir cobertura de testes para cenários de loading, erro e dados reais.
- Avaliar integração com contexto global de modelo ativo, se necessário.

### Alinhamento com Clean Code e ADRs
- Segue Clean Architecture (ADR-0012), Clean Code e padrões de internacionalização do projeto.
- Nomenclatura e estrutura em inglês conforme SDR-0001 e ADR-0015.