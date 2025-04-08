# ISSUE-0068: Consolidação dos Serviços LLM

## Descrição
Consolidar e refatorar todos os serviços relacionados a LLM (Large Language Models) em uma arquitetura unificada e coesa, melhorando:
- Manutenibilidade
- Extensibilidade
- Performance
- Confiabilidade
- Consistência das interfaces

## Contexto
Atualmente temos múltiplas implementações dispersas relacionadas a LLM:
- `useLLM` hook
- WorkerService
- Sistemas de cache, retry, streaming
- Controle de sessões
- Métricas de uso

Esta fragmentação dificulta a manutenção e introdução de novas funcionalidades.

## Objetivos
1. Criar uma arquitetura centralizada para serviços LLM
2. Definir interfaces padrão para:
   - Envio de prompts
   - Gerenciamento de sessões
   - Controle de fluxo (streaming, cancelamento)
   - Coleta de métricas
3. Implementar padrões consistentes para:
   - Tratamento de erros
   - Retry automático
   - Cache de respostas
4. Documentar a nova arquitetura

## Tarefas
- [ ] Analisar implementações existentes
- [ ] Definir arquitetura consolidada (ADR)
- [ ] Refatorar serviços principais
- [ ] Atualizar documentação
- [ ] Implementar testes abrangentes

## Critérios de Aceitação
- Todas funcionalidades existentes mantidas
- Interfaces padronizadas documentadas
- Melhoria mensurável em métricas de performance
- Cobertura de testes >= 90%
- Documentação atualizada

## Relacionado
- ISSUE-0023 (hook useLLM)
- ISSUE-0035 (métricas LLM)
- ISSUE-0038 (sessões LLM)
- ISSUE-0043 (suporte a modelos)
- docs/llm-services.md