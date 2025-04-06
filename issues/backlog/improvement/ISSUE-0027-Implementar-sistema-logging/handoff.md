# Handoff - Sistema de Logging Centralizado

## Visão Geral

Implementar um serviço de logging centralizado com:

- Interface unificada para backend e frontend
- Suporte a múltiplos níveis de log
- Persistência em arquivo
- Fácil integração

## Estrutura Proposta

### Backend (`core/services/logging`)

```typescript
interface Logger {
  info(message: string, metadata?: object): void;
  warn(message: string, metadata?: object): void;
  error(message: string, metadata?: object): void;
}

class FileLogger implements Logger {
  // Implementação com persistência em arquivo
}

// Exportar instância singleton
export const logger = new FileLogger();
```

### Frontend

```typescript
// Interface similar ao backend
interface Logger {
  info(message: string, metadata?: object): void;
  warn(message: string, metadata?: object): void;
  error(message: string, metadata?: object): void;
}

// Implementação que envia logs para o backend via API
export const logger = createFrontendLogger();
```

## Implementação Recomendada

1. **Criar serviço no backend**:

   - Implementar em `core/services/logging`
   - Usar padrão singleton
   - Adicionar rotação de arquivos

2. **Criar interface para frontend**:

   - Exportar objeto logger global
   - Enviar logs para backend via API

3. **Substituir console.log**:
   - Buscar e substituir todos os usos de console.log
   - Usar níveis apropriados (info, warn, error)

## Exemplo de Uso

```typescript
// Backend
import { logger } from "../services/logging";

logger.info("Serviço iniciado", { port: 3000 });
logger.error("Falha na conexão", { error: err });

// Frontend
import { logger } from "../lib/logger";

logger.warn("Dados inválidos", { input: userInput });
```

## Considerações

- Configurar níveis de log por ambiente (mais verboso em dev)
- Adicionar metadata relevante aos logs
- Considerar uso de correlation IDs para rastreamento
- Documentar padrões de uso na wiki do projeto
