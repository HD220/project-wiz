# Documentação dos componentes UI

## Descrição

Documentação técnica dos componentes reutilizáveis da interface do usuário, incluindo:

- ModelCard
- ModelList
- ModelSettings
- Dashboard

## Conteúdo Atual

````markdown
# Documentação de Componentes UI

## ModelCard

Componente que exibe informações sobre um modelo LLM e permite ativação/download.

### Props

```typescript
interface ModelCardProps {
  model: Model;
  isActive: boolean;
  onActivate: (modelId: string) => void;
}
```
````

### Comportamento

- Exibe status do modelo
- Mostra informações básicas
- Permite ativar/baixar modelos

## ModelList

Componente que renderiza uma lista de ModelCards.

### Funcionalidades

- Layout responsivo
- Gerencia estado do modelo ativo
- Atualiza status e data de uso

```

## Tarefas
- [x] Revisar documentação atual
- [x] Completar seções incompletas
- [x] Verificar exemplos de código
- [x] Atualizar links para componentes relacionados

## Critérios de Aceitação
✅ Documentação completa de todos os componentes
✅ Exemplos de código verificados
✅ Links para componentes relacionados funcionais
✅ Seções incompletas finalizadas

## Próximos Passos
1. Mover esta issue para completed
2. Manter documentação atualizada conforme novos componentes forem adicionados
```
