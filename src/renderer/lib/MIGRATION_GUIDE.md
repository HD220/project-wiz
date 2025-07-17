# Guia de Migração - Consolidação de Utilitários

## Visão Geral

Este documento descreve as mudanças realizadas na consolidação de utilitários duplicados no projeto.

## Principais Mudanças

### 1. Consolidação de Utilitários de Status

**Antes:**

```typescript
// Múltiplos arquivos com lógica duplicada
import { getAgentStatusColor } from "@/lib/utils";
import { useAgentStatusUtils } from "@/domains/agents/hooks/use-agent-status-utils.hook";
```

**Depois:**

```typescript
// Utilitário consolidado
import { StatusUtils } from "@/lib/status-utils";
// ou
import { StatusUtils } from "@/lib/ui-utils";
```

### 2. Consolidação de Utilitários de Data

**Antes:**

```typescript
// Funções dispersas em vários arquivos
const getDaysUntilDue = (dueDate?: Date) => {
  /* ... */
};
const formatLastMessageTime = (date?: Date) => {
  /* ... */
};
```

**Depois:**

```typescript
// Utilitário consolidado
import { DateUtils } from "@/lib/date-utils";
// ou
import { DateUtils } from "@/lib/ui-utils";

DateUtils.getDaysUntilDue(date);
DateUtils.formatLastMessageTime(date);
```

### 3. Consolidação de Transformadores de Campo

**Antes:**

```typescript
import { fieldTransformers } from "@/components/forms/field-transformers";
```

**Depois:**

```typescript
import { FieldUtils } from "@/lib/field-utils";
// ou
import { FieldUtils } from "@/lib/ui-utils";

FieldUtils.transformers.channelName(value);
FieldUtils.validators.notEmpty(value);
FieldUtils.formatters.currency(value);
```

### 4. Novos Utilitários de Domínio

**Novo arquivo:** `/src/renderer/lib/domain-utils.ts`

```typescript
import {
  AgentUtils,
  ProjectUtils,
  UserUtils,
  LLMUtils,
  TaskUtils,
} from "@/lib/domain-utils";

// Exemplos de uso
AgentUtils.getInitials(agentName);
ProjectUtils.generateSlug(projectName);
UserUtils.isOnline(lastSeen);
LLMUtils.formatTemperature(0.7);
TaskUtils.getPriorityColor(priority);
```

## Estrutura Consolidada

```
src/renderer/lib/
├── index.ts              # Exportações centralizadas
├── ui-utils.ts           # Ponto de entrada principal
├── utils.ts              # Utilitários básicos (cn, etc.)
├── status-utils.ts       # Utilitários de status
├── date-utils.ts         # Utilitários de data/tempo
├── field-utils.ts        # Utilitários de campo/formulário
├── domain-utils.ts       # Utilitários específicos de domínio
└── file-preview-utils.ts # Utilitários existentes
```

## Importações Recomendadas

### Para Uso Geral

```typescript
// Importação completa (recomendada)
import { DateUtils, StatusUtils, FieldUtils } from "@/lib/ui-utils";

// Importação específica
import { DateUtils } from "@/lib/date-utils";
import { StatusUtils } from "@/lib/status-utils";
```

### Para Domínios Específicos

```typescript
// Utilitários de domínio
import { AgentUtils, ProjectUtils } from "@/lib/domain-utils";

// Ou através do ponto de entrada principal
import { AgentUtils, ProjectUtils } from "@/lib/ui-utils";
```

## Compatibilidade com Versões Anteriores

As seguintes importações ainda funcionam para compatibilidade:

```typescript
// Ainda funcionam (deprecated)
import { getAgentStatusColor } from "@/lib/utils";
import { fieldTransformers } from "@/components/forms/field-transformers";
import { AgentUtils } from "@/domains/agents/utils";
```

## Benefícios da Consolidação

1. **Redução de Duplicação**: Elimina código duplicado entre componentes
2. **Manutenibilidade**: Ponto central para utilitários comuns
3. **Descoberta**: Mais fácil encontrar e usar utilitários existentes
4. **Consistência**: Implementações padronizadas
5. **Teste**: Facilita testes unitários dos utilitários

## Próximos Passos

1. Gradualmente migrar importações para usar os novos utilitários
2. Remover arquivos deprecated após período de transição
3. Adicionar testes unitários para os utilitários consolidados
4. Documentar novos utilitários conforme necessário

## Utilitários Disponíveis

### StatusUtils

- `getAgentStatusColor(status)` - Cor de background do status
- `getAgentStatusText(status)` - Texto localizado do status
- `getAgentStatusInfo(status)` - Informações completas do status

### DateUtils

- `getDaysUntilDue(date)` - Dias até vencimento
- `formatLastMessageTime(date)` - Formatação de última mensagem
- `formatForDisplay(date)` - Formatação para exibição
- `formatRelative(date)` - Formatação relativa (2 horas atrás)
- `isToday(date)` - Verifica se é hoje
- `formatDuration(ms)` - Formata duração

### FieldUtils

- `transformers.*` - Transformações de campo
- `validators.*` - Validações de campo
- `formatters.*` - Formatadores de campo

### UIUtils

- `debounce(func, delay)` - Debounce de função
- `throttle(func, delay)` - Throttle de função
- `formatBytes(bytes)` - Formatação de bytes
- `stringToColor(str)` - Cor baseada em string
- `truncateText(text, length)` - Truncar texto
- `copyToClipboard(text)` - Copiar para área de transferência

### Domain Utils

- `AgentUtils.*` - Utilitários específicos de agentes
- `ProjectUtils.*` - Utilitários específicos de projetos
- `UserUtils.*` - Utilitários específicos de usuários
- `LLMUtils.*` - Utilitários específicos de LLM
- `TaskUtils.*` - Utilitários específicos de tarefas
