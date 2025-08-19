---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(npm run:*), Glob(*), Grep(*), Read(*), LS(*), Bash(find:*)
argument-hint: Descrição detalhada do bug com comportamento esperado vs atual
description: Investigação sistemática e resolução de bugs com análise de causa raiz
---

# Bug Fix Investigation & Resolution - Project Wiz

**ULTRATHINK**: Analise sistematicamente o bug desde os sintomas até a causa raiz, garantindo uma solução robusta e duradoura.

## Bug Description
$ARGUMENTS

## Systematic Bug Investigation Workflow

### STEP 1: BUG REPRODUCTION & VALIDATION

1. **Analyze the bug description** provided above
2. **Identify reproduction steps**:
   - What specific actions trigger the bug?
   - What environment/conditions are required?
   - Is it consistently reproducible?
3. **Define expected vs actual behavior** clearly
4. **Assess severity and impact**:
   - Critical (blocks core functionality)
   - High (affects user experience)
   - Medium (minor inconvenience)
   - Low (cosmetic/edge case)

### STEP 2: SYMPTOM ANALYSIS & EVIDENCE GATHERING

**INSTRUÇÃO CRÍTICA**: Para CADA pista de investigação, SEMPRE inclua referências precisas de arquivo:linha

#### Code Search Strategy:
1. **Search for error messages** (if any):
   - Look for exact error text in codebase
   - Check console logs/error handling
2. **Identify affected components**:
   - Find relevant UI components
   - Locate related IPC handlers
   - Check database queries
3. **Trace data flow**:
   - Follow the path from user action to bug manifestation
   - Identify all touch points

### STEP 3: ROOT CAUSE ANALYSIS

#### Hypothesis-Driven Investigation:

**Template para cada hipótese:**
```
🔍 **HIPÓTESE #N**: Descrição da possível causa
**Local Suspeito**: `arquivo:linha` ou componente
**Evidência**: O que indica essa possibilidade
**Teste**: Como validar/descartar essa hipótese
**Status**: ✅ Confirmada / ❌ Descartada / 🤔 Investigando
```

### STEP 4: SOLUTION DESIGN

Once root cause is identified:

#### Solution Planning:
```
✅ **CAUSA RAIZ IDENTIFICADA**: Descrição da verdadeira causa
**Local**: `arquivo:linha`
**Evidência Conclusiva**: O que prova que esta é a causa

🛠️ **ESTRATÉGIA DE SOLUÇÃO**:
1. **Abordagem**: Como resolver o problema
2. **Arquivos Afetados**: Lista de arquivos que precisam mudança
3. **Impacto**: Outras partes do sistema afetadas
4. **Riscos**: Possíveis efeitos colaterais
5. **Testes**: Como validar a correção
```

#### Solution Options Assessment:
- **Quick Fix**: Solução rápida mas talvez temporária
- **Proper Fix**: Solução robusta e duradoura
- **Refactor**: Se o bug indica problema de design

### STEP 5: IMPLEMENTATION STRATEGY

#### Pre-Implementation Checklist:
- [ ] **Backup**: Commit/stash current work
- [ ] **Tests**: Understand how to test the fix
- [ ] **Dependencies**: Check what else might break
- [ ] **Documentation**: Note what needs updating

#### Implementation Plan:
```
📋 **PLANO DE IMPLEMENTAÇÃO**

**Passo 1**: Descrição
- Arquivo: `caminho/arquivo:linha`
- Mudança: Específica

**Passo 2**: Descrição
- Arquivo: `caminho/arquivo:linha`
- Mudança: Específica

[... mais passos conforme necessário]

**Verificação Final**:
- [ ] Executar testes
- [ ] Verificar casos relacionados
- [ ] Confirmar que bug foi resolvido
```

### STEP 6: PREVENTION ANALYSIS

#### Future-Proofing Questions:
1. **Como evitar que esse bug aconteça novamente?**
2. **Que testes/validações poderiam ter detectado isso?**
3. **Há outros lugares com padrão similar que podem ter o mesmo problema?**
4. **A arquitetura atual facilita ou dificulta esse tipo de bug?**

```
🛡️ **MEDIDAS PREVENTIVAS**:
- **Validações**: Que validações implementar  
- **Documentação**: Que padrões documentar
- **Refactoring**: Que melhorias arquiteturais considerar
```

## Investigation Tools & Commands

### Code Analysis:
```bash
# Search for specific patterns
grep -r "pattern" src/ --include="*.ts" --include="*.tsx"

# Find files by type
find src -name "*.schema.ts" -o -name "*.hook.ts"

# Check recent changes in specific area
git log --since="1 week ago" --grep="area" --oneline

# Look for error handling
grep -r "catch\|throw\|Error" src/ --include="*.ts"
```

### Testing & Validation:
```bash
# Check types
npm run type-check

# Format
npm run format

# Lint 
npm run lint:fix
```

## Bug Fix Documentation Template

### Final Report Format:

```markdown
## 🐛 Bug Fix Summary

**Bug**: Descrição concisa do problema
**Root Cause**: Causa raiz identificada
**Solution**: Abordagem da solução
**Files Changed**: Lista de arquivos modificados

### 🔍 Investigation Process

1. **Symptoms**: O que foi observado
2. **Hypotheses Tested**: 
   - ❌ Hipótese descartada - razão
   - ✅ Hipótese confirmada - evidência
3. **Root Cause**: Explicação detalhada

### 🛠️ Implementation Details

**Changes Made**:
- `arquivo:linha` - descrição da mudança
- `arquivo:linha` - descrição da mudança

**Testing**:
- [ ] Manual testing completed
- [ ] Edge cases verified

### 🛡️ Prevention Measures

- **Added validations**: Onde e por quê
- **Improved error handling**: Como
- **Documentation updates**: O que foi documentado

### 🧪 Verification Steps

Para verificar que o bug foi resolvido:
1. Passo específico de teste
2. Resultado esperado
3. Como confirmar sucesso
```

## Critical Reminders

- **EVIDENCE-BASED**: Cada conclusão deve ter evidência concreta
- **ARQUIVO:LINHA**: Sempre referencie localizações específicas
- **ROOT CAUSE**: Não pare nos sintomas, encontre a causa real
- **SIDE EFFECTS**: Considere impacto em outras partes do sistema
- **TESTING**: Valide a correção antes de considerar resolvido
- **PREVENTION**: Pense em como evitar bugs similares no futuro

**Lembre-se**: Um bug bem investigado e corrigido é uma oportunidade de melhorar a qualidade geral do sistema.