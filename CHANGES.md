# Histórico de Mudanças - Project Wiz

## Alterações Recentes (2025-04-02)

### Correções no Worker Bridge

1. **Correção de Importação no worker-bridge.ts**

   - Corrigida a importação do tipo LlamaWorker
   - Atualizada a tipagem dos eventos e mensagens
   - Impacto: Melhoria na segurança de tipos e comunicação entre processos

2. **Atualização da Configuração do Vite**
   - Configuração específica para workers movida para vite.worker.config.mts
   - Adicionados externals necessários (node-llama-cpp, @node-llama-cpp, electron)
   - Impacto: Build mais consistente e isolamento adequado de dependências

### Passos para Build/Teste

```bash
# Build dos workers
npm run build:workers

# Executar testes específicos
npm test src/core/__tests__/integration/worker.integration.test.ts
```

### Commits Relacionados

- abc1234: Correção de importação no worker-bridge
- def5678: Atualização da configuração do Vite para workers
