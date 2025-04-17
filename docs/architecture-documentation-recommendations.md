# Recomendações para Documentação Arquitetural

## Resumo dos Problemas Identificados

1. **Referências incorretas**:
   - Múltiplas referências ao ADR-0008 quando o correto é ADR-0012
   - Links incompletos para ADRs em vários documentos

2. **Duplicação de arquivos**:
   - llm-services.md existe em docs/ e docs/services/

3. **Nomenclatura inconsistente**:
   - architecture.md é pouco descritivo (deveria ser architecture-overview.md)

4. **Falta de contexto arquitetural**:
   - ui-components.md não explica como os componentes se integram à Clean Architecture

5. **Links cruzados ausentes**:
   - Documentação não referencia adequadamente decisões arquiteturais relacionadas

## Recomendações por Arquivo

### ui-components.md
1. **Adicionar seção "Contexto Arquitetural"**:
   ```markdown
   ## Contexto Arquitetural
   Os componentes UI integram-se à camada de apresentação da Clean Architecture ([ADR-0012](../adr/ADR-0012-Clean-Architecture-LLM.md)):
   - Consomem serviços via hook `useLLM`
   - Segregam lógica de apresentação da lógica de negócio
   - Implementam padrões de design consistentes ([ADR-0002](../adr/ADR-0002-Componentes-shadcn-ui.md))
   ```

2. **Atualizar referências**:
   - Adicionar links para ADRs relevantes
   - Incluir diagrama de integração com backend

### llm-services.md
1. **Consolidar arquivos**:
   - Manter apenas docs/services/llm-services.md
   - Atualizar referências em outros documentos

2. **Corrigir referências a ADRs**:
   - Substituir ADR-0008 por ADR-0012
   - Adicionar links completos para decisões relacionadas

3. **Adicionar seção "Evolução Arquitetural"**:
   ```markdown
   ## Evolução Arquitetural
   - Versão 1.0: Implementação inicial ([ISSUE-0068](../../issues/backlog/improvement/ISSUE-0068-Consolidacao-servicos-LLM/README.md))
   - Versão 2.0: Refatoração para Clean Architecture ([ADR-0012](../adr/ADR-0012-Clean-Architecture-LLM.md))
   ```

### architecture.md → architecture-overview.md
1. **Renomear arquivo**:
   - Novo nome: architecture-overview.md

2. **Corrigir referências**:
   - Atualizar todas as menções a ADR-0008 para ADR-0012

3. **Adicionar seção "Governança"**:
   ```markdown
   ## Governança Arquitetural
   - Decisões documentadas como ADRs ([GDR-0001](../gdr/GDR-0001-Governanca-Processo-ADRs.md))
   - Mudanças significativas requerem atualização desta documentação
   ```

## Plano de Implementação

1. **Priorização**:
   - [ ] 1. Corrigir referências a ADRs (crítico)
   - [ ] 2. Consolidar llm-services.md (alto impacto)
   - [ ] 3. Renomear architecture.md (baixo risco)
   - [ ] 4. Adicionar contexto arquitetural (valor agregado)

2. **Passos Técnicos**:
   ```mermaid
   gantt
       title Cronograma de Implementação
       dateFormat  YYYY-MM-DD
       section Correções
       Atualizar referências      :done, 2025-04-17, 1d
       Consolidar llm-services.md :active, 2025-04-18, 2d
       section Melhorias
       Renomear arquivos          :2025-04-20, 1d
       Adicionar contexto         :2025-04-21, 2d
   ```

3. **Validação**:
   - Verificar links após atualizações
   - Garantir consistência com ADRs
   - Atualizar documentation-status.md

## Templates e Referências

- [Template de Documentação Técnica](../templates/technical-documentation.md)
- [Template ADR](../templates/ADR.md)
- [Guia de Estilo](../style-guide.md)

**Última Atualização**: 2025-04-16