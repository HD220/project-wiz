# Refatoração: Substituir Button+Link por CustomLink

Este documento lista todos os arquivos/componentes que precisam ser refatorados para usar o novo componente `CustomLink` ao invés do padrão `<Button asChild><Link>`.

## Componente CustomLink

**Localização:** `src/renderer/components/custom-link.tsx`

**Uso:**
```tsx
// Antes
<Button variant="ghost" className="w-full justify-start" asChild>
  <Link to="/path" params={{ id }}>
    <Icon />
    <span>Text</span>
  </Link>
</Button>

// Depois
<CustomLink
  to="/path"
  params={{ id }}
  variant="ghost"
  className="w-full justify-start"
>
  <Icon />
  <span>Text</span>
</CustomLink>
```

## Arquivos que precisam ser refatorados:

### 1. `/src/renderer/app/(user)/index.tsx`
**Linhas aproximadas:** 3 ocorrências
**Padrão encontrado:**
```tsx
<Button variant="outline" className="w-full justify-start" asChild>
  <Link to="/">Start a new chat</Link>
</Button>
<Button variant="outline" className="w-full justify-start" asChild>
  <Link to="/">View your tasks</Link>
</Button>
<Button variant="outline" className="w-full justify-start" asChild>
  <Link to="/">Browse documentation</Link>
</Button>
```

### 2. `/src/renderer/features/project-management/components/channels-sidebar.tsx`
**Linhas aproximadas:** 4 ocorrências principais + canais dinâmicos
**Padrão encontrado:**
```tsx
<Button variant="ghost" className="w-full justify-start px-2 py-1.5 h-auto" asChild>
  <Link to="/project/$projectId" params={{ projectId }}>
    <Home className="w-4 h-4 mr-2 text-muted-foreground" />
    <span>Dashboard</span>
  </Link>
</Button>
```
**Seções a refatorar:**
- Dashboard link
- Agentes link  
- Tarefas link
- Documentos link
- Canal links (dentro do map de filteredChannels)

### 3. `/src/renderer/components/layout/app-sidebar.tsx`
**Status:** Verificar se há Button+Link patterns para Settings

### 4. Verificar outros arquivos potenciais:
- `/src/renderer/features/project-management/components/project-sidebar-item.tsx` (já usa Link direto)
- `/src/renderer/features/direct-messages/components/conversation-list.tsx` (já usa Link direto)

## Tarefas de Refatoração:

- [ ] **app-sidebar.tsx**: Converter Settings button se necessário
- [ ] **index.tsx**: Converter 3 buttons de ações rápidas  
- [ ] **channels-sidebar.tsx**: Converter 4 navigation buttons + channel links
- [ ] **Verificar**: Buscar outros padrões Button+Link no projeto
- [ ] **Teste**: Garantir que activeProps funciona corretamente no CustomLink

## Benefícios da refatoração:

1. **DRY**: Elimina código repetitivo
2. **Consistência**: Padroniza todos os button-links
3. **Manutenção**: Centralizaça lógica em um componente
4. **Performance**: Reduz bundle size
5. **Type Safety**: Props tipadas do TanStack Router

## Notas importantes:

- Manter todas as props `activeProps` e `activeOptions` existentes
- Preservar classes CSS e variantes de Button
- Testar navegação após cada refatoração
- O CustomLink já suporta forwardRef para compatibilidade