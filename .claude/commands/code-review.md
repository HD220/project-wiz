---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git show:*)
description: Realizar code review detalhado com contexto git, referências precisas de arquivo:linha e boas práticas
---

# Code Review Detalhado - Project Wiz

**ULTRATHINK**: Analise profundamente cada aspecto do código modificado considerando arquitetura, segurança, performance e manutenibilidade.

## Contexto Git Atual

### Status do Repositório

!`git status --porcelain`

### Branch Atual

!`git branch --show-current`

### Diferenças (Staged)

!`git diff --cached --name-only`

### Diferenças (Working Directory)

!`git diff --name-only`

### Commits Recentes (últimos 5)

!`git log --oneline -5`

### Diferenças Detalhadas (Staged + Working)

!`git diff HEAD`

## Formato Obrigatório para Constatações

**INSTRUÇÃO CRÍTICA**: Para CADA constatação (issue, problema, melhoria), SEMPRE inclua:

### Como Identificar Referências Precisas:

1. **No git diff**: As linhas modificadas mostram `@@` com os números de linha
2. **Ao ler arquivos**: Use a ferramenta `Read` - ela já mostra `linha→conteúdo`
3. **Para blocos de código**: Use formato `linha_início-linha_fim`
4. **Para mudanças específicas**: Referencie exatamente a linha onde o problema ocorre
5. **Seja preciso**: Use os números de linha exatos, não aproximações

### Formato para Issues/Problemas:

````
❌ **PROBLEMA**: Descrição clara do issue
**Local**: `arquivo:linha` ou `arquivo:linha_início-linha_fim`
**Código atual**:
```typescript
// Código problemático exato
````

**Solução**:

```typescript
// Código corrigido sugerido
```

**Justificativa**: Por que isso é um problema e como a solução resolve

### Formato para Melhorias:

```
🔧 **MELHORIA**: Descrição da otimização sugerida
**Local**: `arquivo:linha`
**Impacto**: Performance/Manutenibilidade/Legibilidade
**Sugestão**: Como implementar a melhoria
```

### Formato para Aprovações:

```
✅ **APROVADO**: Aspecto bem implementado
**Local**: `arquivo:linha` (opcional)
**Motivo**: Por que está correto
```

## Processo de Análise

**IMPORTANTE**: Para análise detalhada de arquivos específicos, use a ferramenta `Read` para ver o conteúdo completo com números de linha no formato `linha→conteúdo`.

## Checklist de Code Review

Analise TODOS os arquivos modificados seguindo este roteiro detalhado com **referências específicas de arquivo:linha**:

### 1. **Conformidade com Arquitetura Project Wiz**

- [ ] **Estrutura de Diretórios**: Código está no local correto (main/, renderer/, shared/)?
- [ ] **Naming Conventions**: Arquivos seguem padrões (.schema.ts, .hook.ts, .types.ts)?
- [ ] **Imports**: Ordem correta (Node.js → React → External → Internal → Types)?
- [ ] **Exports**: Usando export na declaração, evitando export default?

### 2. **TypeScript & Qualidade de Código**

- [ ] **Types**: Usando `type` ao invés de `interface`?
- [ ] **Validation**: Schemas Zod implementados corretamente?
- [ ] **Error Handling**: Tratamento adequado de erros?
- [ ] **Performance**: Funções com menos de 50 linhas, arquivos com menos de 500?

### 3. **React & Frontend (se aplicável)**

- [ ] **Component Structure**: Seguindo ordem mandatória (imports → types → component)?
- [ ] **Hooks**: Usando useApiMutation para chamadas API?
- [ ] **Props**: Destructuring nos parâmetros?
- [ ] **i18n**: Todo texto UI usando LinguiJS (Trans/t)?
- [ ] **Forms**: Validação com react-hook-form + Zod?

### 4. **IPC & Backend (se aplicável)**

- [ ] **Authentication**: Handlers protegidos usam requireAuth()?
- [ ] **Authorization**: Verificações de permissão adequadas?
- [ ] **Input Validation**: Schemas de entrada e saída definidos?
- [ ] **Database**: Usando Drizzle ORM corretamente?
- [ ] **Events**: EventBus usado apenas no main process?

### 5. **Segurança**

- [ ] **Sensitive Data**: Sem secrets/keys expostos?
- [ ] **SQL Injection**: Queries parametrizadas?
- [ ] **XSS Prevention**: Input sanitizado adequadamente?
- [ ] **Auth Checks**: Recursos protegidos verificam autenticação?

### 6. **Performance & Otimização**

- [ ] **Database**: Índices apropriados para queries?
- [ ] **React**: Evitando re-renders desnecessários?
- [ ] **Lazy Loading**: Componentes/rotas carregados sob demanda quando necessário?
- [ ] **Bundle Size**: Imports específicos ao invés de bibliotecas inteiras?

### 7. **Testes & Qualidade**

- [ ] **Lint**: Código passa no npm run lint?
- [ ] **Type Check**: Sem erros de TypeScript?
- [ ] **Testing**: Funcionalidades críticas têm testes?
- [ ] **Edge Cases**: Casos extremos considerados?

### 8. **UX & Acessibilidade**

- [ ] **Loading States**: Feedback visual durante operações?
- [ ] **Error States**: Mensagens de erro claras e úteis?
- [ ] **Responsive**: Interface funciona em diferentes tamanhos?
- [ ] **Keyboard Navigation**: Acessível via teclado?

### 9. **Documentação & Manutenibilidade**

- [ ] **Comments**: Código complexo está documentado?
- [ ] **README**: Atualizações necessárias documentadas?
- [ ] **CLAUDE.md**: Novos padrões adicionados se necessário?
- [ ] **API Changes**: Breaking changes documentadas?

## Análise Específica do Projeto

Considerando que este é o **Project Wiz** (sistema de automação com IA agents):

### Aspectos Críticos

1. **AI Integration**: Chamadas para LLMs estão otimizadas e com error handling?
2. **Agent Management**: Criação/edição de agents segue padrões estabelecidos?
3. **Project Context**: Gerenciamento de contexto de projetos está consistente?
4. **Performance**: Operações AI não bloqueiam a UI?
5. **Data Privacy**: Dados sensíveis do usuário estão protegidos?

### Verificações Específicas

- [ ] **Queue System**: BullMQ implementado corretamente para jobs AI?
- [ ] **Provider Integration**: Múltiplos LLMs (OpenAI, Anthropic, etc.) funcionando?
- [ ] **Local Database**: SQLite operações são transaction-safe?
- [ ] **Encryption**: API keys armazenadas com segurança?
- [ ] **Offline Mode**: Funcionalidades core funcionam offline?

## Recomendações Finais

Após a análise completa, forneça:

### 1. **Resumo Executivo**

- **Status**: 🟢 Aprovado / 🟡 Requer Mudanças / 🔴 Rejeitar
- **Resumo**: Estado geral do código em 2-3 frases

### 2. **Issues Críticos** (que impedem merge)

Para cada issue crítico:

```
🚨 **CRÍTICO**: Descrição
**Arquivo**: `caminho/arquivo:linha`
**Ação Requerida**: O que deve ser feito
```

### 3. **Melhorias Sugeridas** (não bloqueantes)

Para cada melhoria:

```
💡 **MELHORIA**: Descrição
**Arquivo**: `caminho/arquivo:linha`
**Benefício**: Que vantagem traz
```

### 4. **Aprovações Específicas**

Destaque aspectos bem implementados:

```
👏 **BEM FEITO**: O que foi bem implementado
**Arquivo**: `caminho/arquivo:linha`
```

### 5. **Próximos Passos**

- Lista ordenada por prioridade
- Estimativa de tempo para correções críticas
- Comandos específicos para verificação

### 6. **Resumo de Localização**

Tabela resumo de todos os problemas encontrados:
| Severidade | Arquivo | Linha | Problema |
|------------|---------|-------|----------|
| 🚨 Crítico | `arquivo:linha` | Descrição curta |
| 🔧 Melhoria | `arquivo:linha` | Descrição curta |

**Lembre-se**: Priorize SIMPLICIDADE, MANUTENIBILIDADE e CONSISTÊNCIA sobre soluções elegantes complexas.
