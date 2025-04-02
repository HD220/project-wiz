# Documentação de Componentes UI

## Visão Geral

Componentes reutilizáveis que compõem a interface do usuário do Project Wiz.

---

## ModelCard

### Descrição

Componente que exibe informações sobre um modelo LLM e permite ativação/download.

### Props

```typescript
interface Model {
  id: number;
  name: string;
  modelId: string;
  size: string;
  status: string; // 'downloaded' | 'not_downloaded'
  lastUsed: string | null;
  description: string;
}

interface ModelCardProps {
  model: Model;
  isActive: boolean;
  onActivate: (modelId: string) => void;
}
```

### Comportamento

- Exibe status do modelo (Ativo/Baixado/Não baixado)
- Mostra informações básicas (nome, ID, tamanho, descrição)
- Permite ativar modelos já baixados
- Oferece opção para baixar modelos não disponíveis

### Exemplo de Uso

````tsx
<ModelCard
  model={{
## ModelList

### Descrição
Componente que renderiza uma lista de ModelCards, gerenciando o estado dos modelos ativos.

### Funcionalidades
- Renderiza ModelCards em layout responsivo (1 coluna mobile, 2-3 colunas desktop)
- Gerencia o estado do modelo ativo
- Atualiza o status e data de uso dos modelos

### Exemplo de Uso
```tsx
function Example() {
  return (
    <div className="p-4">
      <ModelList />
    </div>
  );
}
## ModelSettings

### Descrição
Componente principal para configuração e gerenciamento de modelos LLM, com múltiplas abas:
1. **Available Models**: Lista de modelos disponíveis
2. **Model Configuration**: Parâmetros do modelo
3. **Performance**: Monitoramento de recursos

### Funcionalidades Principais
- Seletor de modelo ativo (apenas modelos baixados)
- Controles deslizantes para:
  - Temperatura (0-1)
  - Tokens máximos (256-4096)
  - Limite de memória (4-16GB)
- Alternador para atualizações automáticas
- Visualização de desempenho

### Exemplo de Uso
```tsx
function App() {
  return (
    <div className="p-4">
      <ModelSettings />
    </div>
  );
}
```

### Componentes Relacionados
- [ModelList](#modellist) - Lista de modelos integrada
## Dashboard

### Descrição
Componente principal que exibe métricas e atividades do sistema, incluindo:
- Status do modelo ativo
- Métricas de issues, PRs e documentação
- Atividades recentes

### Seções Principais
1. **Métricas**:
   - Issues ativas
   - Pull Requests abertos
   - Documentação gerada
   - Status do modelo
2. **Atividade Recente**: Lista das últimas ações realizadas

### Exemplo de Uso
```tsx
function App() {
  return (
    <div className="p-4">
      <Dashboard />
    </div>
  );
}
```

### Componentes Relacionados
- [ModelSettings](#modelsettings) - Configurações do modelo
- [ModelList](#modellist) - Lista de modelos disponíveis
- [useLLM](../src/client/hooks/use-llm.ts) - Dados de execução

- [ModelCard](#modelcard) - Componentes individuais de modelo
- [useLLM](../src/client/hooks/use-llm.ts) - Configurações de execução

---

````

### Componentes Relacionados

- [ModelCard](#modelcard) - Componentes individuais de modelo
- [useLLM](../src/client/hooks/use-llm.ts) - Hook para integração com serviços LLM

---

    id: 1,
    name: "Llama 3",
    modelId: "llama-3-8b",
    size: "8GB",
    status: "downloaded",
    description: "Modelo de última geração para tarefas gerais",

}}
isActive={true}
onActivate={(modelId) => console.log(`Ativando ${modelId}`)}
/>

```

### Componentes Relacionados

- [ModelList](#modellist) - Lista de ModelCards
- [useLLM](../src/client/hooks/use-llm.ts) - Hook para gerenciamento de modelos

---

## Próximos Componentes

- ModelList
- ModelSettings
- Dashboard
```
