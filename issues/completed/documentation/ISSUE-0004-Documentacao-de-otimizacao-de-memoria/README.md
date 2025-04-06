# Documentação de otimização de memória para LLMs

## Descrição

Documentação das estratégias e implementações para otimização de memória no uso de modelos de linguagem (LLMs), incluindo:

- Problemas atuais de consumo de memória
- Estratégias de otimização
- Implementações recomendadas
- Status das implementações

## Conteúdo Atual

Consulte o arquivo completo em [docs/memory-optimization.md](../docs/memory-optimization.md)

### Exemplos de Uso

1. **Descarregar um modelo manualmente**:

```typescript
import { workerService } from "../core/services/llm";

// Descarregar modelo específico
await workerService.unloadModel("model-id");

// Descarregar todos os modelos não utilizados
await workerService.cleanupUnusedModels();
```

2. **Configurar limites de memória**:

```typescript
// Configurar máximo de 2GB por modelo
workerService.setMemoryLimit("model-id", 2048);

// Verificar uso atual
const usage = workerService.getMemoryUsage();
console.log(`Uso atual: ${usage.current}MB de ${usage.limit}MB`);
```

3. **Monitorar consumo**:

```typescript
// Assinar eventos de memória
workerService.on("memory-warning", (usage) => {
  console.warn(`Aviso: ${usage.percent}% de memória utilizada`);
});
```

## Implementação Concluída

1. Cache LRU para modelos ✅ (2025-04-02)
2. Limpeza automática de recursos ✅ (2025-04-02)
3. Monitoramento de memória ✅ (2025-04-02)
4. Documentação técnica atualizada ✅ (2025-04-02)
5. Exemplos de uso adicionados ✅ (2025-04-05)

```

## Histórico de Implementação

- **2025-04-02**: Implementadas otimizações de memória no WorkerService
  - Cache LRU para modelos
  - Limpeza automática de recursos
  - Monitoramento de memória
  - Documentação técnica atualizada

## Tarefas

- [x] Revisar documentação atual
- [x] Atualizar status das implementações
- [x] Adicionar exemplos de uso
- [x] Documentar métricas de monitoramento

## Critérios de Aceitação

- Documentação completa sobre otimização de memória
- Status atualizado das implementações
- Exemplos práticos incluídos
- Métricas de monitoramento documentadas
```
