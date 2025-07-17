# Resolver Issues da Lista

## Instruções para Claude Code

Este comando resolve um item da lista de issues em `docs/fixes/issues.md`, priorizando qualidade e refatoração.

### Objetivo

Resolver 1 item da lista de issues, marcando como concluído e focando em simplificação, reestruturação e boas práticas sempre que possível.

### Comportamento Geral

#### 1. Carregamento da Lista

- Ler arquivo `docs/fixes/issues.md`
- Identificar próximo item não concluído (checkbox desmarcado)
- Se lista estiver vazia ou todos itens concluídos, informar usuário

#### 2. Análise da Issue

**Para cada issue identificada:**

- **Analisar complexidade**: Simples, Médio, Complexo
- **Investigar causa raiz**: Não apenas sintoma, mas origem do problema
- **Buscar contexto**: Analisar código relacionado ao problema
- **Identificar oportunidades**: Como resolver melhorando o código

### Processo de Resolução

#### 1. Investigação Profunda

**Análise obrigatória:**

- `Task`: Buscar arquivos relacionados ao problema
- `Grep`: Encontrar padrões similares ou código relacionado
- `Read`: Analisar código específico mencionado na issue
- **Entender contexto completo**: Como o problema se encaixa no sistema

#### 2. Estratégia de Resolução

**Prioridades (em ordem):**

1. **Simplificação**: Como tornar o código mais simples e claro
2. **Reestruturação**: Melhorar organização e arquitetura
3. **Boas práticas**: Aplicar padrões e convenções do projeto
4. **Performance**: Otimizar se necessário
5. **Correção mínima**: Resolver apenas o problema (último recurso)

#### 3. Análise de Complexidade

**Simples (resolver diretamente):**

- Bug localizado em arquivo único
- Correção óbvia sem side effects
- Problema de UI/UX simples
- Typo ou erro de lógica básico

**Médio (planejar e executar):**

- Bug que afeta múltiplos arquivos
- Problema que requer refatoração localizada
- Issue que pode melhorar padrão existente
- Correção que impacta outros componentes

**Complexo (quebrar em subitens):**

- Problema arquitetural profundo
- Bug que revela design flaw
- Issue que requer reestruturação major
- Problema de performance sistêmico

#### 4. Planejamento para Issues Complexas

**Quando issue for complexa:**

- Quebrar em subitens gerenciáveis
- Adicionar subitens no próprio issues.md
- Implementar subitem por subitem
- Manter progresso atualizado

**Formato de quebra:**

```markdown
- [ ] Problema complexo original
  - [ ] Subitem 1: Analisar causa raiz
  - [ ] Subitem 2: Refatorar módulo X
  - [ ] Subitem 3: Implementar nova estrutura
  - [ ] Subitem 4: Migrar código existente
  - [ ] Subitem 5: Testar integração
```

### Estratégias de Melhoria

#### 1. Simplificação de Código

**Sempre considerar:**

- Eliminar duplicação de código
- Extrair lógica complexa para funções dedicadas
- Reduzir nesting e complexity
- Usar padrões mais simples e claros

#### 2. Reestruturação

**Oportunidades comuns:**

- Extrair logic para services apropriados
- Mover responsabilidades para camadas corretas
- Consolidar arquivos relacionados
- Melhorar separação de concerns

#### 3. Aplicação de Boas Práticas

**Verificar sempre:**

- Seguir convenções de nomenclatura
- Aplicar padrões de error handling
- Melhorar tipagem TypeScript
- Adicionar validações adequadas
- Seguir princípios SOLID

#### 4. Refatoração Oportunista

**Durante resolução, procurar:**

- Código relacionado que pode ser melhorado
- Padrões que podem ser consolidados
- Performance que pode ser otimizada
- Documentação que pode ser adicionada

### Processo de Implementação

#### 1. Resolução Simples

```markdown
1. Analisar problema
2. Identificar solução ideal (não apenas fix)
3. Implementar melhoria/correção
4. Marcar checkbox como concluído
```

#### 2. Resolução Complexa

```markdown
1. Analisar problema profundamente
2. Quebrar em subitens gerenciáveis
3. Adicionar subitens no issues.md
4. Implementar subitem por subitem
5. Marcar subitens conforme completados
6. Marcar item principal quando todos subitens concluídos
```

#### 3. Atualização da Lista

**Marcar como concluído:**

- Mudar `- [ ]` para `- [x]`
- **NÃO remover** item da lista
- Manter histórico de resolução

### Qualidade da Resolução

#### 1. Análise da Causa Raiz

**Não apenas corrigir sintoma:**

- Entender por que problema ocorreu
- Resolver causa fundamental
- Prevenir problemas similares
- Melhorar robustez geral

#### 2. Impacto Sistêmico

**Considerar sempre:**

- Como resolução afeta outras partes do sistema
- Se mudança melhora arquitetura geral
- Se create oportunidades de consolidação
- Se introduz novas dependencies ou complexidade

#### 3. Manutenibilidade

**Garantir que resolução:**

- Torna código mais fácil de manter
- Melhora legibilidade
- Segue padrões estabelecidos
- Reduz technical debt

### Ferramentas Obrigatórias

#### Análise Inicial

- `Read`: Carregar e analisar issues.md
- `Task`: Buscar arquivos relacionados
- `Grep`: Encontrar padrões e código relacionado

#### Durante Resolução

- `Read`: Analisar código a ser modificado
- `Edit`/`MultiEdit`: Fazer correções
- `Write`: Criar novos arquivos se necessário
- `Bash`: Executar comandos necessários

#### Validação

- `Edit`: Atualizar issues.md marcando como concluído
- `Bash`: Executar lint/type-check se necessário

### Critérios de Sucesso

**Resolução bem-sucedida quando:**

- [ ] Problema original foi resolvido completamente
- [ ] Código melhorou em qualidade/organização
- [ ] Não introduziu novos problemas
- [ ] Seguiu padrões estabelecidos do projeto
- [ ] Checkbox foi marcado como concluído
- [ ] Sistema continua funcionando normalmente

### Tratamento de Casos Especiais

#### 1. Issue Obsoleta

Se problema não existe mais:

- Investigar se foi resolvido indiretamente
- Marcar como concluído com nota
- Documentar como foi resolvido

#### 2. Issue Ambígua

Se problema não está claro:

- Documentar need for clarification
- Marcar como requires investigation
- Pular para próximo item

#### 3. Issue que Revela Problema Maior

Se descobrir problema arquitetural maior:

- Resolver issue imediata com fix mínimo
- Documentar problema maior como nova issue
- Adicionar nova issue à lista

### Resultado Esperado

- Um item da lista resolvido completamente
- Código melhorado através da resolução
- Issues.md atualizado com progresso
- Sistema mais robusto após resolução
- Oportunidades de melhoria aproveitadas
