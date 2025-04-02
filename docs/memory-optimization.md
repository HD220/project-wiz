# Plano de Otimização de Memória para LLMs

## Problemas Atuais

1. Modelos permanecem carregados em memória indefinidamente
2. Não há limpeza automática de recursos não utilizados
3. Possível vazamento de memória em sessões prolongadas
4. Consumo elevado com múltiplos modelos carregados

## Estratégias de Otimização

### 1. Gerenciamento de Modelos

- Implementar cache LRU (Least Recently Used) para modelos
- Limitar número máximo de modelos carregados simultaneamente
- Adicionar métodos para descarregar modelos explicitamente:
  ```typescript
  async unloadModel() {
    this.model?.dispose();
    this.model = undefined;
  }
  ```

### 2. Limpeza Automática

- Descarregar modelos após período de inatividade
- Limpar contextos e sessões quando não utilizados
- Implementar garbage collection periódico

### 3. Monitoramento

- Adicionar métricas de consumo de memória
- Logar avisos quando limites são atingidos
- Expor métricas via API para monitoramento

### 4. Alocação Eficiente

- Usar memória compartilhada entre processos
- Configurar parâmetros de contexto para balancear memória/performance
- Permitir configuração de limites de memória por modelo

## Implementação Recomendada

1. Implementado em `WorkerService`:

```typescript
private loadedModels = new Map<string, { lastUsed: number; size: number }>();
private maxModels = 3;

// Implementa cache LRU com limpeza automática
private cleanupOldModels() { ... }
```

2. Monitoramento implementado:

```typescript
private monitorMemoryUsage() {
  setInterval(() => {
    // Verificar e limpar recursos se necessário
  }, 60000);
}
```

3. Documentar boas práticas para consumidores da API

## Implementação Concluída

1. Cache LRU para modelos ✅
2. Limpeza automática de recursos ✅
3. Monitoramento de memória ✅
