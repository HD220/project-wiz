# /feature-plan [caminho] - Criar Documentação de Feature

## Instruções para Claude Code

Este comando cria documentação completa para uma nova feature baseada em análise profunda da codebase atual.

### Parâmetros
- **$ARGUMENTS**: Pode ser:
  - Descrição direta da feature a ser implementada
  - Caminho para arquivo de brainstorm já salvo (ex: `docs/brainstorms/2024-01-15-sistema-notificacoes.md`)

### Comportamento Geral

#### 1. Análise Inicial
Antes de criar qualquer documentação, realize uma análise completa:

**Busca por Padrões:**
- Use `Task` para encontrar módulos similares à feature proposta
- Use `Grep` para identificar padrões de implementação existentes
- Analise a estrutura de módulos em `src/main/modules/` e `src/renderer/features/`

**Análise de Arquitetura:**
- Examine como módulos existentes seguem DDD (domain/, application/, persistence/, ipc/)
- Identifique padrões de nomenclatura
- Verifique como IPC é implementado entre main/renderer
- Analise uso de stores Zustand, TanStack Query, React Hook Form

**Identificação de Dependências:**
- Busque integrações necessárias com módulos existentes
- Identifique bibliotecas e frameworks já utilizados
- Verifique schemas de banco de dados relacionados
- Analise tipos compartilhados em `src/shared/types/`

#### 2. Análise de Reutilização
**Código Reutilizável:**
- Identifique services, repositories ou components que podem ser aproveitados
- Analise mappers e DTOs similares
- Verifique validações Zod existentes
- Procure por padrões de error handling

**Oportunidades de Refatoração:**
- Identifique código que pode ser melhorado ao implementar a feature
- Busque duplicações que podem ser eliminadas
- Analise pontos onde abstrações podem ser criadas

#### 3. Análise de Impacto
**Integração com Sistema:**
- Verifique como a feature se integra com fluxos existentes
- Identifique pontos de modificação necessários
- Analise impactos em outras features
- Verifique necessidade de migrações de banco

**Considerações de Performance:**
- Analise impacto em queries existentes
- Verifique necessidade de índices de banco
- Considere otimizações de frontend (virtualization, memoização)

### Processo de Criação

#### 1. Estrutura de Pastas
Crie a estrutura em `docs/developer/[nome-feature]/`:
```
docs/developer/[nome-feature]/
├── requirements.md
├── use-cases.md  
├── implementation-guide.md
└── implementation-plan.md
```

#### 2. Ordem de Criação
1. **requirements.md**: Baseado na análise de código e necessidades identificadas
2. **use-cases.md**: Definindo fluxos baseados em padrões existentes  
3. **implementation-guide.md**: Guia detalhado com exemplos do código atual
4. **implementation-plan.md**: Checklist executável baseado na arquitetura atual

#### 3. Qualidade da Documentação

**Requirements.md:**
- Requisitos funcionais baseados em análise real do código
- Dependências identificadas através de busca na codebase
- Riscos baseados em complexidade real dos módulos existentes
- Impactos verificados através de análise de integração

**Use-cases.md:**
- Casos de uso baseados em fluxos similares existentes
- Fluxos de exceção baseados em error handling atual
- Cenários de teste derivados de implementações similares

**Implementation-guide.md:**
- Exemplos de código reais da codebase atual
- Padrões arquiteturais extraídos de módulos existentes
- Guias de integração baseados em como outros módulos se conectam
- Referências específicas a arquivos e linhas de código relevantes

**Implementation-plan.md:**
- Tarefas baseadas na estrutura real do projeto
- Critérios de aceite específicos para a arquitetura atual
- Ordem de implementação otimizada para minimizar conflitos
- Subtarefas que consideram complexidade real do código

### Ferramentas de Análise

**Use intensivamente:**
- `Task`: Para buscar arquivos e padrões relacionados
- `Grep`: Para encontrar implementações e padrões específicos
- `Read`: Para analisar código relevante em detalhe
- `Glob`: Para encontrar arquivos por padrões

**Análise Obrigatória:**
- Módulos similares em `src/main/modules/`
- Features similares em `src/renderer/features/`
- Schemas relacionados em `src/main/persistence/schemas/`
- Tipos relacionados em `src/shared/types/`
- Mappers existentes (*.mapper.ts)
- Handlers IPC em módulos similares


### Validação Final

Antes de finalizar, verifique se:
- [ ] Todos os 4 documentos foram criados
- [ ] Implementation-guide contém exemplos reais do código atual
- [ ] Dependencies identificadas são reais (verificadas na codebase)
- [ ] Padrões arquiteturais seguem os existentes no projeto
- [ ] Implementation-plan é executável e específico
- [ ] Referências a arquivos e código são precisas

### Templates Utilizados
- Base: `docs/templates/feature-template/`
- Adaptação: Baseada em análise real da codebase atual
- Exemplos: Extraídos de implementações existentes similares

### Resultado Esperado
Documentação completa, precisa e executável que permita implementar a feature seguindo exatamente os padrões do projeto, com mínimo de problemas de integração e máximo aproveitamento de código existente.