# Plano de Refatoração - Project Wiz

Este documento contém o plano completo de refatoração identificado durante a análise da arquitetura de roteamento e navegação do Project Wiz.

## ✅ Itens Concluídos

- ✅ **Corrigir ordem das mensagens no chat (novas no final + scroll)**
- ✅ **Corrigir grupos duplicados no sidebar (apenas CANAIS DE TEXTO)**
- ✅ **Substituir location.pathname.includes por useMatchRoute**
- ✅ **Implementar activeOptions e activeProps nos Links**
- ✅ **Criar CustomLink component para Button+Link**

## 🔄 Itens Pendentes

### 🚨 Alta Prioridade

#### 6. Refatorar arquitetura ProjectSidebar vs ChannelsSidebar
**Problema:** Separação confusa entre ProjectSidebar e ChannelsSidebar
**Solução proposta:**
- **ProjectSidebar** = lista de projetos (vertical, esquerda) ✅ já correto
- **ChannelsSidebar** deve ser renomeado/refatorado para **ProjectNavigation** 
- Mover navegação interna do projeto (canais, agentes, etc.) para o layout do projeto
- Remover confusão arquitetural atual

**Arquivos afetados:**
- `/src/renderer/features/project-management/components/channels-sidebar.tsx` → `project-navigation.tsx`
- `/src/renderer/app/project/$projectId/route.tsx`
- Possível criação de novo component layout interno

### 🔧 Média Prioridade

#### 5. Melhorar transição entre projetos (loading suave)
**Problema:** Tela pisca com "Carregando projeto..." ao navegar entre projetos
**Solução proposta:**
- Implementar loading state apenas no ícone do projeto na sidebar principal
- Usar Suspense boundaries adequados
- Implementar skeleton loading para transições suaves
- Evitar flash de "Carregando..." em tela cheia

**Arquivos afetados:**
- `/src/renderer/app/project/$projectId/route.tsx` (linha 120-126)
- `/src/renderer/features/project-management/components/project-sidebar-item.tsx`
- Possível novo component de loading state

#### 8. Migrar useEffect para carregamento por rota
**Problema:** useEffect manual ao invés de route loaders do TanStack Router
**Solução proposta:**
- Substituir `useEffect` de carregamento de dados por `route.loader`
- Implementar `route.beforeLoad` onde apropriado
- Usar `route.errorComponent` para tratamento de erros
- Melhorar performance e UX com carregamento nativo do router

**Arquivos afetados:**
- `/src/renderer/app/project/$projectId/route.tsx` (linhas 38-49)
- `/src/renderer/features/direct-messages/components/conversation-view.tsx` (linhas 24-30)
- Outros componentes que fazem carregamento manual

#### 4. Refatoração CustomLink (REFACTOR_CUSTOMLINK.md)
**Status:** Componente criado, falta aplicar em todos os locais
**Referência:** Ver arquivo `REFACTOR_CUSTOMLINK.md` para detalhes completos

### 📋 Baixa Prioridade

#### 7. Investigar Route Masking para modals
**Problema:** Controle manual de show/hide modals
**Solução proposta:**
- Investigar Route Masking do TanStack Router
- Implementar modal routes se viável
- Considerar alternativas como search params para estado de modal

**Arquivos potencialmente afetados:**
- `/src/renderer/features/direct-messages/components/new-conversation-modal.tsx`
- `/src/renderer/features/project-management/components/create-project-modal.tsx`
- `/src/renderer/features/project-management/components/create-channel-modal.tsx`

## 📝 Detalhes de Implementação

### Próximos Passos Recomendados

1. **Refatorar Arquitetura ProjectSidebar vs ChannelsSidebar**
   - Renomear `channels-sidebar.tsx` para `project-navigation.tsx`
   - Reavaliar responsabilidades dos componentes
   - Melhorar organização do layout interno do projeto

2. **Implementar Loading Suave**
   - Criar component de loading state para projetos
   - Implementar skeleton loading
   - Otimizar UX de transições

3. **Migrar para Route Loaders**
   - Substituir useEffect por loaders nativos
   - Implementar error boundaries apropriados
   - Melhorar performance de carregamento

4. **Finalizar CustomLink**
   - Aplicar em todos os locais identificados
   - Testar funcionalidade completa
   - Remover código duplicado

### Critérios de Sucesso

- ✅ Navegação fluida sem piscar/flash
- ✅ URL como única fonte de verdade para estado
- ✅ Arquitetura de componentes clara e lógica
- ✅ Performance otimizada com route loaders
- ✅ Código DRY com CustomLink
- ✅ Tratamento adequado de estados de loading/error

### Notas Técnicas

- **TanStack Router:** Aproveitar ao máximo recursos nativos (loaders, search params, etc.)
- **Performance:** Evitar re-renders desnecessários
- **UX:** Transições suaves e feedback visual adequado
- **Manutenibilidade:** Componentes com responsabilidades bem definidas
- **Type Safety:** Manter tipagem rigorosa em todas as mudanças

### Arquivos de Referência

- `REFACTOR_CUSTOMLINK.md` - Detalhes sobre refatoração do CustomLink
- `CLAUDE.md` - Instruções do projeto e arquitetura atual
- `src/renderer/components/custom-link.tsx` - Componente base criado

---

**Última atualização:** Session atual
**Status geral:** 5/9 itens concluídos (55% completo)