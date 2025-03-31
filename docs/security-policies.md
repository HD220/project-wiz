# Políticas de Segurança do LLMWorker

## Visão Geral
Este documento descreve as políticas de segurança implementadas para o UtilityProcess do LLMWorker, incluindo:

- Sandboxing estrito
- Content Security Policy (CSP)
- Filtragem de APIs
- Limites de recursos

## Configuração Padrão

### Sandbox
```typescript
{
  enabled: true,      // Ativa isolamento do processo
  nodeIntegration: false,  // Desabilita acesso direto ao Node.js
  contextIsolation: true   // Isola contextos de execução
}
```

### Content Security Policy
Diretivas padrão:
```
default-src 'self';
script-src 'self' 'unsafe-eval';
style-src 'self' 'unsafe-inline'; 
connect-src 'self'
```

### APIs Permitidas
```typescript
["llm", "ipc", "fs:read"]  // APIs disponíveis para o worker
```

### Limites de Recursos
```typescript
{
  cpu: {
    maxUsage: 80     // % máxima de uso da CPU
  },
  memory: {
    maxMB: 1024      // Limite de memória em MB
  }
}
```

## Customização

Para modificar as políticas padrão:

```typescript
import { SecurityPolicyManager } from "./llm/SecurityPolicyManager";

const customPolicy = {
  allowedAPIs: ["llm"], // Restringe apenas à API LLM
  resourceLimits: {
    cpu: { maxUsage: 50 }, // Reduz uso máximo de CPU
    memory: { maxMB: 512 } // Reduz limite de memória
  }
};

const policyManager = new SecurityPolicyManager(customPolicy);
```

## Boas Práticas

1. **Sandboxing**
   - Mantenha sempre habilitado
   - Nunca ative nodeIntegration em produção
   - Use contextIsolation para proteção adicional

2. **CSP**
   - Evite 'unsafe-eval' e 'unsafe-inline' quando possível
   - Restrinja origens de conexão ao mínimo necessário

3. **APIs**
   - Siga o princípio do menor privilégio
   - Adicione APIs à lista branca apenas quando necessário
   - Use namespaces para organizar APIs (ex: "fs:read")

4. **Recursos**
   - Ajuste limites conforme capacidade da máquina
   - Monitore uso real para definir valores adequados
   - Considere limites mais restritos para dispositivos móveis