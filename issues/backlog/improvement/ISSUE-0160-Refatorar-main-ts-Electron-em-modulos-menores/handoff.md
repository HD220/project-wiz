# Handoff - ISSUE-0160 - Refatorar main.ts do Electron em módulos menores

## Status Atual
- Issue criada e detalhada com contexto, problemas, proposta e critérios
- Análise completa do arquivo `src/core/infrastructure/electron/main.ts` realizada
- Identificadas múltiplas responsabilidades, confirmando a necessidade da refatoração

## Resumo da Análise
- **Handlers IPC:** agrupados em funções específicas para history, GitHub token, worker e GPU
- **API HTTP Express:** função dedicada com múltiplos endpoints e middleware de autenticação
- **Criação da janela Electron:** função `createWindow()` com configurações de segurança
- **Bootstrap:** inicialização de serviços, registro de handlers, criação da janela e API

## Próximos Passos Recomendados
1. **Criar estrutura de pastas e arquivos:**
   - `src/core/infrastructure/electron/ipc-handlers/`
   - `src/core/infrastructure/electron/window.ts`
   - `src/core/infrastructure/electron/mobile-api.ts`
2. **Extrair funções:**
   - Mover cada grupo de handlers para arquivos separados em `ipc-handlers/`
   - Mover `startMobileApiServer()` para `mobile-api.ts`
   - Mover `createWindow()` para `window.ts`
3. **Simplificar `main.ts`:**
   - Manter apenas o bootstrap e orquestração
   - Reduzir para menos de 100 linhas
4. **Testar cuidadosamente:**
   - Garantir que todos os handlers e APIs continuam funcionando
   - Validar integração entre módulos
5. **Atualizar documentação:**
   - Refletir a nova estrutura modularizada

## Riscos e Pontos de Atenção
- Quebra de funcionalidades se a extração não for feita com cuidado
- Dependências cruzadas entre módulos
- Garantir que o contexto do Electron (ex: `app`, `ipcMain`) seja passado corretamente

## Relacionamento
Relacionado à issue de segurança **ISSUE-0152** para reforço da arquitetura.

---

**Responsável pela análise:** Roo  
**Data:** 10/04/2025