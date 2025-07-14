# /feature-plan-analyze [caminho] - Auditoria da Documentação de Feature

## Instruções para Claude Code

Este comando realiza uma auditoria completa da documentação de feature gerada, validando consistência, completude e alinhamento com a codebase atual.

### Parâmetros

- **$ARGUMENTS**: Caminho para a pasta da feature em `docs/developer/[nome-feature]/`. Se não especificado, analisa a documentação mais recente ou em progresso.

### Objetivo

Fazer um double-check da documentação criada pelo `/feature-plan`, verificando se está válida, consistente e executável sem fazer reescrita completa - apenas identificando e corrigindo problemas. Inclui validação da **estratégia híbrida LLM + Humano** e viabilidade das divisões de responsabilidade propostas.

### Processo de Auditoria

#### 1. Validação de Consistência

**Entre Documentos:**

- Verificar se requirements.md está alinhado com use-cases.md
- Confirmar se implementation-guide.md cobre todos os requisitos
- Validar se implementation-plan.md implementa todos os casos de uso
- Checar se não há contradições entre os documentos

**Nomenclatura e Terminologia:**

- Verificar consistência de nomes de entidades, services, componentes
- Confirmar se terminologia segue padrões do projeto
- Validar se nomes de arquivos seguem convenções (kebab-case)

#### 2. Validação Técnica

**Análise da Codebase Atual:**

- Re-verificar se dependências identificadas existem realmente
- Confirmar se padrões arquiteturais estão corretos
- Validar se exemplos de código estão atualizados
- Verificar se integrações propostas são factíveis

**Busca por Conflitos:**

- Procurar por conflitos com implementações existentes
- Identificar nomes que podem colidir com código atual
- Verificar se schemas de banco não conflitam
- Analisar se rotas/IPC handlers não duplicam existentes

**Verificação de Dependências:**

- Confirmar que todas as dependências listadas existem
- Verificar se versões de bibliotecas são compatíveis
- Validar se integrações com LLMs estão corretas
- Checar se dependências de outros módulos estão precisas

#### 3. Validação de Arquitetura

**Padrões DDD:**

- Verificar se estrutura de módulo segue padrão do projeto
- Confirmar se separação de camadas está correta
- Validar se responsabilidades estão bem definidas

**Integração IPC:**

- Verificar se handlers IPC seguem padrões existentes
- Confirmar se tipos compartilhados estão corretos
- Validar se comunicação main/renderer está bem definida

**Frontend Architecture:**

- Verificar se stores Zustand seguem padrões
- Confirmar se hooks TanStack Query estão corretos
- Validar se componentes seguem estrutura existente

#### 4. Validação de Executabilidade

**Implementation Plan:**

- Verificar se tarefas estão na ordem correta
- Confirmar se critérios de aceite são mensuráveis
- Validar se subtarefas são realmente necessárias
- Checar se estimativas de complexidade são realistas

**Estratégia Híbrida LLM + Humano:**

- Validar se divisão 🤖 LLM vs 👨‍💻 Humano é realista para cada tarefa
- Verificar se tarefas marcadas como "🤖 LLM Executa" são realmente automatizáveis
- Confirmar se tarefas "👨‍💻 Humano Valida" requerem realmente decisão humana
- Avaliar se percentuais de automação (75% LLM, 25% Humano) são viáveis

**Viabilidade Técnica:**

- Confirmar se implementação é factível com ferramentas atuais
- Verificar se não há bloqueadores técnicos
- Validar se performance será adequada
- Checar se escalabilidade foi considerada
- Avaliar se workflow híbrido proposto é executável na prática

#### 5. Identificação de Lacunas

**Requisitos Faltantes:**

- Buscar requisitos não funcionais que podem ter sido esquecidos
- Identificar casos de uso edge que não foram cobertos
- Verificar se validações necessárias foram incluídas
- Procurar por aspectos de segurança não considerados

**Considerações de UX:**

- Verificar se fluxos de usuário estão completos
- Confirmar se feedback visual foi considerado
- Validar se accessibility foi incluída
- Checar se responsividade foi planejada

#### 6. Busca por Melhorias

**Oportunidades de Otimização:**

- Identificar pontos onde código pode ser mais eficiente
- Buscar oportunidades de reutilização não exploradas
- Verificar se abstrações podem ser melhoradas
- Procurar por padrões que podem ser aplicados

**Refatorações Adicionais:**

- Identificar código que poderia ser melhorado junto com a feature
- Buscar duplicações que podem ser eliminadas
- Verificar se há oportunidades de simplificação

### Ferramentas de Validação

**Análise Obrigatória:**

- `Task`: Para re-verificar busca por arquivos relacionados
- `Grep`: Para confirmar padrões e verificar conflitos
- `Read`: Para validar exemplos de código e referências
- `Glob`: Para verificar estruturas de arquivo

**Pontos de Verificação:**

- Comparar com módulos similares para garantir consistência
- Verificar schemas de banco para evitar conflitos
- Analisar tipos TypeScript para compatibilidade
- Revisar handlers IPC existentes para padrões

### Processo de Correção

#### 1. Identificação de Problemas

Para cada problema encontrado:

- **Classificar severidade**: Crítico, Médio, Baixo
- **Identificar causa**: Inconsistência, falta de informação, erro técnico
- **Propor solução**: Correção específica necessária

#### 2. Correções Incrementais

- **Não reescrever**: Apenas corrigir problemas identificados
- **Manter estrutura**: Preservar organização original dos documentos
- **Melhorar precisão**: Adicionar detalhes faltantes ou corrigir imprecisões
- **Atualizar referências**: Corrigir links e referências incorretas

#### 3. Validação Final

Após correções:

- Re-verificar consistência entre documentos
- Confirmar que todas as referências estão corretas
- Validar que plan é executável
- Verificar que não há conflitos com codebase

### Relatório de Auditoria

Gerar relatório resumindo:

- **Problemas encontrados**: Lista categorizada de issues
- **Correções aplicadas**: O que foi corrigido
- **Melhorias sugeridas**: Otimizações adicionais
- **Pontos de atenção**: Aspectos que precisam de cuidado na implementação

### Resultado Esperado

- Documentação validada e corrigida
- Inconsistências resolvidas
- Lacunas identificadas e preenchidas
- Plan de implementação verificado como executável
- **Estratégia híbrida LLM + Humano validada** como realista e executável
- Relatório de auditoria com pontos de atenção específicos para automação

### Critérios de Aprovação

A documentação está aprovada quando:

- [ ] Não há contradições entre documentos
- [ ] Todas as referências de código estão corretas
- [ ] Dependencies existem e são compatíveis
- [ ] Implementation plan é executável step-by-step
- [ ] Não há conflitos com código existente
- [ ] Padrões arquiteturais seguem projeto atual
- [ ] UX flows estão completos e consistentes
- [ ] **Estratégia híbrida LLM + Humano** é realista e bem definida
- [ ] **Divisão de responsabilidades** (🤖 vs 👨‍💻) está adequada para cada tarefa
- [ ] **Workflow proposto** é executável e eficiente
