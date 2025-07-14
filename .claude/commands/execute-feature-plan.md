# /execute-feature-plan [caminho] - Executar Plano de Implementação

## Instruções para Claude Code

Este comando executa ou continua o desenvolvimento de uma feature conforme o plano de implementação documentado.

### Parâmetros

- **$ARGUMENTS**: Caminho para a pasta da feature em `docs/developer/[nome-feature]/`. Se não especificado, busca o plano em progresso ou pergunta qual executar.

### Objetivo

Implementar a feature seguindo exatamente o implementation-plan.md, mantendo progresso atualizado e garantindo implementações completas sem TODOs.

### Comportamento Geral

#### 1. Localização do Plano

- Se caminho fornecido em $ARGUMENTS, usar diretamente
- Senão, buscar `implementation-plan.md` na pasta `docs/developer/[feature-name]/`
- Se múltiplas features, perguntar qual executar
- Carregar e analisar o estado atual do plano

#### 2. Análise de Complexidade

Para cada item do checklist:

- **Avaliar complexidade**: Simples, Médio, Complexo
- **Identificar dependências**: O que precisa estar pronto antes
- **Verificar pré-requisitos**: Se requisitos estão atendidos

#### 3. Quebra de Tarefas Complexas

**Critérios para quebrar tarefa:**

- Implementação que envolve múltiplos arquivos (>3)
- Lógica que requer várias etapas distintas
- Integração com múltiplos módulos
- Mudanças que afetam banco + backend + frontend

**Processo de quebra:**

- Dividir em subtarefas menores e manejáveis
- Cada subtarefa deve ser completável independentemente
- Manter ordem lógica de dependências
- Atualizar o implementation-plan.md com subtarefas

#### 4. Implementação

**Princípios fundamentais:**

- **Implementação completa**: Nunca deixar TODOs, "implementar futuramente", ou placeholders
- **Seguir nova arquitetura**: Usar domínios (projects/agents/users/llm) em vez de módulos
- **Object Calisthenics**: Entidades ricas, Value Objects obrigatórios, funções simples
- **Infraestrutura transparente**: Usar getDatabase(), getLogger(), publishEvent()
- **Reutilizar código**: Aproveitar implementações existentes sempre que possível
- **Manter qualidade**: Code style, error handling, validações completas

### Processo de Execução

#### 1. Preparação

- Ler implementation-plan.md completamente
- Identificar próximo item não concluído
- Verificar se pré-requisitos estão atendidos
- Analisar impacto e complexidade

#### 2. Análise de Complexidade

**Simples (executar diretamente):**

- Criação de arquivo único
- Modificação localizada
- Implementação seguindo padrão claro existente

**Médio (planejar antes de executar):**

- Múltiplos arquivos relacionados
- Lógica que precisa de validação
- Integração com 1-2 módulos

**Complexo (quebrar em subtarefas):**

- Implementação que afeta múltiplas camadas
- Integração com vários módulos
- Mudanças que requerem migrações
- Funcionalidades com múltiplos fluxos

#### 3. Quebra de Tarefas (quando necessário)

```markdown
- [ ] **Tarefa Complexa Original**
  - **Subtarefas:**
    - [ ] Subtarefa 1: Criar estrutura base
    - [ ] Subtarefa 2: Implementar lógica core
    - [ ] Subtarefa 3: Adicionar validações
    - [ ] Subtarefa 4: Integrar com módulo X
    - [ ] Subtarefa 5: Testar integração
```

#### 4. Implementação de Item

**Para cada tarefa/subtarefa:**

1. **Análise prévia**: Ler código relacionado, entender contexto
2. **Implementação completa**: Fazer toda a implementação sem deixar pendências
3. **Validação**: Verificar se critérios de aceite foram atendidos
4. **Update do progresso**: Marcar como concluído no plan

#### 5. Atualização do Progresso

**Marcar como concluído quando:**

- Implementação está 100% completa
- Não há TODOs ou placeholders
- Critérios de aceite foram atendidos
- Código segue padrões do projeto
- Testes passando (se aplicável)

**Formato de atualização:**

```markdown
- [x] **Tarefa concluída**
  - ✅ Implementada em [data]
  - Arquivos: file1.ts, file2.tsx, file3.ts
```

### Estratégias de Implementação

#### 1. Reutilização Inteligente

- Sempre buscar código similar existente antes de implementar
- Copiar e adaptar padrões de módulos similares
- Reutilizar validações, mappers, DTOs existentes
- Aproveitar componentes UI similares

#### 2. Implementação Incremental

- Começar pela estrutura base (Value Objects, entidades ricas)
- Implementar camada por camada (entities → functions → ipc → ui)
- Usar infraestrutura transparente (sem DI container)
- Testar integração a cada camada completada
- Manter sistema funcionando a cada commit

#### 3. Qualidade First

- Seguir exatamente padrões de nomenclatura do projeto
- Implementar error handling robusto
- Adicionar logging apropriado
- Usar tipagem TypeScript completa
- Seguir convenções de commit

#### 4. Gestão de Dependências

- Resolver dependências em ordem lógica
- Se bloqueado por dependência, marcar item como bloqueado
- Continuar com itens independentes
- Voltar a itens bloqueados quando dependências forem resolvidas

### Ferramentas de Desenvolvimento

**Análise obrigatória antes de implementar:**

- `Read`: Ler implementation-guide.md e arquivos relacionados
- `Task`: Buscar implementações similares para reutilizar
- `Grep`: Encontrar padrões existentes
- `Glob`: Localizar arquivos relacionados

**Durante implementação:**

- `Edit`/`MultiEdit`: Para modificações de arquivos
- `Write`: Para novos arquivos
- `Bash`: Para comandos necessários (migrações, etc.)

### Tratamento de Problemas

#### 1. Bloqueadores

**Quando encontrar bloqueador:**

- Documentar o problema no implementation-plan.md
- Procurar solução alternativa
- Se não resolver, marcar como bloqueado e continuar outros itens
- Reportar bloqueador para resolução manual

#### 2. Mudanças de Escopo

**Se descobrir que implementação difere do planejado:**

- Analisar se mudança é necessária
- Atualizar documentation conforme necessário
- Continuar implementação com novo escopo
- Documentar mudança no plan

#### 3. Complexidade Subestimada

**Se tarefa for mais complexa que esperado:**

- Parar implementação atual
- Quebrar em subtarefas menores
- Atualizar implementation-plan.md
- Recomeçar com subtarefas

### Critérios de Qualidade

**Cada implementação deve:**

- [ ] Seguir nova arquitetura de domínios (projects/agents/users/llm)
- [ ] Aplicar Object Calisthenics (≤10 linhas/método, ≤2 variáveis instância)
- [ ] Usar Value Objects para todos os primitivos
- [ ] Usar infraestrutura transparente (getDatabase(), getLogger(), etc.)
- [ ] Ter error handling apropriado
- [ ] Incluir validações necessárias
- [ ] Usar tipagem TypeScript completa
- [ ] Seguir convenções de nomenclatura
- [ ] Estar integrada corretamente
- [ ] Não ter TODOs ou placeholders
- [ ] Atender critérios de aceite definidos

### Resultado Esperado

- Feature implementada incrementalmente
- Implementation-plan.md atualizado com progresso real
- Código de alta qualidade seguindo padrões do projeto
- Sistema funcionando a cada etapa completada
- Problemas documentados e resolvidos ou escalados

### Finalização

Quando todos os itens estiverem concluídos:

- Marcar status geral como "Concluído"
- Atualizar data de conclusão
- Executar comandos de validação (lint, type-check) se disponíveis
- Documentar qualquer desvio do plano original
