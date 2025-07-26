# createProviderRegistry - Implementação Dinâmica para Aplicação Desktop

## Pesquisa Realizada

### O que é createProviderRegistry

O `createProviderRegistry` é uma função utilitária do Vercel AI SDK que permite gerenciar múltiplos provedores de IA de forma centralizada:

- **Propósito**: Centralizar o gerenciamento de provedores e modelos de IA
- **Formato de acesso**: `providerId:modelId` (ex: `openai:gpt-4`, `deepseek:chat`)
- **Separador customizável**: Por padrão usa `:`, mas pode ser alterado
- **Tipos suportados**: Language models, text embedding models, image models

### Exemplo Básico (Estático)

```typescript
const registry = createProviderRegistry({
  openai: openai({ apiKey: "sk-..." }),
  deepseek: deepseek({ apiKey: "sk-..." }),
});

// Uso
const model = registry.languageModel("openai:gpt-4");
```

### Problema da Implementação Estática

- API keys hardcoded no código
- Não permite usuários cadastrarem seus próprios provedores
- Não funciona para aplicação desktop multiusuário
- Não é flexível para adicionar/remover provedores dinamicamente

## Brainstorm - Solução Dinâmica

### Contexto da Aplicação Project Wiz

1. **Aplicação desktop Electron** com SQLite local
2. **Multiusuário**: Cada usuário tem seus próprios provedores
3. **API keys criptografadas** no banco de dados
4. **Cadastro dinâmico**: Usuários podem adicionar/remover provedores
5. **Sem hardcoding**: Nenhuma API key ou provedor fixo no código

### Arquitetura Proposta

#### 1. **DynamicProviderRegistry** - Factory Principal

```typescript
class DynamicProviderRegistry {
  static async createForUser(userId: string): Promise<ProviderRegistry>;
  static clearCache(userId: string): void;
}
```

#### 2. **ProviderRegistryCache** - Gerenciamento de Cache

```typescript
class ProviderRegistryCache {
  private static cache = new Map<string, ProviderRegistry>();
  static get(userId: string): ProviderRegistry | null;
  static set(userId: string, registry: ProviderRegistry): void;
  static invalidate(userId: string): void;
}
```

#### 3. **ProviderFactory** - Criação de Provedores

```typescript
class ProviderFactory {
  static create(type: ProviderType, config: ProviderConfig): Provider;
}
```

### Fluxo de Implementação

1. **Login do usuário** → Carrega provedores do banco
2. **Criação do registry** → Monta registry dinâmico com provedores do usuário
3. **Cache** → Mantém registry em memória para performance
4. **Uso** → `registry.languageModel("openai:gpt-4")`
5. **Invalidação** → Quando usuário modifica provedores, limpa cache

### Vantagens da Solução

✅ **Dinâmico**: Registry criado em runtime baseado nos dados do usuário
✅ **Seguro**: API keys criptografadas, sem hardcoding
✅ **Performance**: Cache evita recriação desnecessária
✅ **Flexível**: Fácil adicionar novos tipos de provedor
✅ **Multiusuário**: Cada usuário tem seu próprio registry
✅ **Manutenível**: Centraliza lógica de provedor

## Implementação Técnica

### Interface Principal

```typescript
interface UserProviderRegistry {
  getLanguageModel(modelId: string): LanguageModel;
  getAvailableModels(): string[];
  refreshRegistry(): Promise<void>;
}
```

### Uso nos Services

```typescript
// Antes (estático)
switch (provider.type) {
  case "openai":
    return openai(model);
  case "deepseek":
    return deepseek(model);
}

// Depois (dinâmico)
const registry = await DynamicProviderRegistry.createForUser(userId);
const model = registry.languageModel(`${provider.type}:${modelName}`);
```

### Benefícios para Clean Code

- **Elimina switch statements** repetitivos
- **Centraliza configuração** de provedores
- **Simplifica adição** de novos provedores
- **Melhora testabilidade** com interfaces bem definidas
- **Reduz acoplamento** entre services e provedores específicos

## Próximos Passos

1. Implementar `DynamicProviderRegistry`
2. Criar `ProviderRegistryCache`
3. Refatorar services para usar registry dinâmico
4. Adicionar testes unitários
5. Documentar API para desenvolvedores

## Referências

- [AI SDK Provider Registry](https://ai-sdk.dev/docs/reference/ai-sdk-core/provider-registry)
- [AI SDK Provider Management](https://ai-sdk.dev/docs/ai-sdk-core/provider-management)
- [Vercel AI SDK Template](https://vercel.com/templates/next.js/ai-sdk-provider-registry)
