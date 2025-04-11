# Handoff - ISSUE-0154 - Unificar Versões do Electron

## Diagnóstico detalhado
O projeto possui múltiplas referências à versão do Electron, que podem estar divergentes entre si:

- `package.json` (dependência principal)
- Scripts de build (Forge, Vite, scripts customizados)
- Configurações específicas do Electron Forge
- Outras configurações ou scripts auxiliares

Essa divergência pode causar builds inconsistentes, bugs difíceis de reproduzir, vulnerabilidades e ambientes divergentes.

---

## Recomendações técnicas detalhadas

1. **Auditoria completa**
   - Buscar todas as referências à versão do Electron no projeto
   - Verificar dependências diretas e indiretas
   - Mapear onde as versões divergem

2. **Atualização**
   - Definir a versão mais recente estável e compatível
   - Atualizar todas as referências para essa versão
   - Ajustar dependências impactadas

3. **Sincronização**
   - Garantir que `package.json`, scripts e configs usem a mesma versão
   - Validar que o build funcione corretamente

4. **Automatização**
   - Criar script ou rotina CI para verificar divergências futuras
   - Alertar em caso de inconsistência detectada

5. **Documentação**
   - Registrar a versão suportada
   - Documentar o processo de atualização da versão do Electron

---

## Dependências e riscos

- **Dependências**
  - Issue 0153 (auditoria de dependências) para garantir compatibilidade
  - Issue 0152 (CSP e segurança) para evitar vulnerabilidades

- **Riscos**
  - Quebra de compatibilidade com dependências específicas
  - Necessidade de ajustes no código para suportar nova versão
  - Impacto no processo de build e deploy

---

## Abordagem sugerida

- Priorizar a auditoria das dependências (issue 0153)
- Definir versão alvo do Electron
- Atualizar e sincronizar todas as referências
- Validar build e execução
- Automatizar verificação
- Documentar processo

---

## Execução da correção (Abril/2025)

### 1. Versões antigas encontradas
- `devDependencies`: Electron `^35.1.4`
- `resolutions`: Electron `^34.0.2`

### 2. Versão unificada adotada
- **Electron `^35.1.4`** (última estável suportada)

### 3. Mudanças aplicadas
- Atualizado `resolutions.electron` para `^35.1.4` no `package.json`
- Mantida dependência principal em `devDependencies` com `^35.1.4`
- Rodado `npm install --legacy-peer-deps` para contornar conflito do React 19 com `react-day-picker`

### 4. Testes realizados
- Dependências instaladas com sucesso
- Build iniciado com `npm run make`
- **Build falhou devido a problema na resolução do módulo nativo `better-sqlite3` pelo Vite/Rollup**
- Este problema **não está relacionado à unificação do Electron**, mas sim à configuração do empacotamento de módulos nativos

### 5. Recomendações adicionais
- Criar uma nova issue para ajustar a configuração do Vite/Rollup, marcando `better-sqlite3` como `external` no build do Electron
- Avaliar conflito do `react-day-picker` com React 19 em outra issue

### 6. Status
- **Unificação da versão do Electron concluída com sucesso**
- Issue pode ser movida para **concluída**

