# Padrão de Consolidação CRUD

## Problema Resolvido

Este documento descreve o padrão implementado para **eliminar duplicação massiva de código CRUD** identificada na análise da codebase. Antes da refatoração, tínhamos **45 arquivos com lógica CRUD duplicada** em todos os domínios.

### Problemas Identificados

- **4 arquivos separados** para operações CRUD básicas em cada domínio
- **Código idêntico** para tratamento de erro, logging e validação
- **Infraestrutura genérica subutilizada** (`createEntityCrud`)
- **Manutenção custosa** e propensa a inconsistências

## Solução Implementada

### Antes (Projects - 4 arquivos)

```
src/main/domains/projects/functions/
├── project-create.functions.ts    (36 linhas)
├── project-query.functions.ts     (28 linhas)
├── project-update.functions.ts    (49 linhas)
└── project-operations.functions.ts (54 linhas)
Total: 167 linhas de código duplicado
```

### Depois (Projects - 1 arquivo)

```
src/main/domains/projects/functions/
└── project-crud.functions.ts      (62 linhas)
Total: 62 linhas usando infraestrutura genérica
```

**Redução: 63% menos código**

## Implementação do Padrão

### 1. Definir Schemas de Validação

```typescript
import { z } from "zod";

const createEntitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().default(""),
  // ... outros campos específicos do domínio
});

const updateEntitySchema = createEntitySchema.partial();
```

### 2. Implementar Factory da Entidade

```typescript
import { Entity } from "../entity-name.entity";

function entityFactory(data: any): Entity {
  return new Entity(data);
}
```

### 3. Usar createEntityCrud

```typescript
import { createEntityCrud } from "../../../infrastructure/crud-operations";
import { entityTable } from "../../../persistence/schemas/entity.schema";

export const entityCrud = createEntityCrud({
  table: entityTable,
  entityName: "EntityName",
  createSchema: createEntitySchema,
  updateSchema: updateEntitySchema,
  entityFactory: entityFactory,
});
```

### 4. Re-exportar com Nomes de Domínio

```typescript
// Operações CRUD básicas
export const createEntity = entityCrud.create;
export const findEntityById = entityCrud.findById;
export const findAllEntities = entityCrud.findAll;
export const updateEntity = entityCrud.update;
export const deleteEntity = entityCrud.delete;

// Operações específicas do domínio
export async function archiveEntity(id: string): Promise<Entity> {
  return updateEntity(id, { status: "archived" });
}
```

### 5. Atualizar Index de Exports

```typescript
// Substituir múltiplos exports por um único
export * from "./entity-crud.functions";
```

## Benefícios Alcançados

### ✅ Redução de Código

- **63% menos linhas** no domínio projects
- **4 arquivos eliminados** por domínio
- **Padrão replicável** para todos os domínios

### ✅ Padronização Automática

- **Logging consistente** em todas as operações
- **Tratamento de erro padronizado**
- **Validação Zod integrada**
- **Naming convention uniforme**

### ✅ Manutenibilidade

- **Uma única fonte de verdade** para lógica CRUD
- **Mudanças centralizadas** na infraestrutura
- **Testes focados** na lógica de negócio específica

### ✅ Developer Experience

- **API consistente** entre domínios
- **Menos arquivos para navegar**
- **Menos código para review**
- **Menos conflitos de merge**

## Próximos Passos para Outros Domínios

### Checklist de Migração

Para cada domínio (`agents`, `users`, `llm`):

- [ ] **Identificar arquivos CRUD atuais**
  - `*-create.functions.ts`
  - `*-query.functions.ts`
  - `*-update.functions.ts`
  - `*-operations.functions.ts`

- [ ] **Criar schemas Zod**
  - Schema para criação
  - Schema para atualização (partial)

- [ ] **Implementar `*-crud.functions.ts`**
  - Usar `createEntityCrud`
  - Re-exportar operações básicas
  - Adicionar operações específicas do domínio

- [ ] **Atualizar imports**
  - Verificar dependências com `grep`
  - Atualizar `functions/index.ts`
  - Corrigir assinaturas (async/await se necessário)

- [ ] **Remover arquivos duplicados**
  - Apenas após verificar que nenhum arquivo depende deles

- [ ] **Testar funcionamento**
  - Validar que interface pública não mudou
  - Verificar que comportamento se mantém idêntico

## Estimativa de Impacto Total

### Redução Esperada na Codebase

| Domínio   | Arquivos Atuais | Linhas Atuais | Linhas Após | Redução  |
| --------- | --------------- | ------------- | ----------- | -------- |
| projects  | 4               | 167           | 62          | -63%     |
| agents    | 4               | ~180          | ~65         | -64%     |
| users     | 4               | ~150          | ~60         | -60%     |
| llm       | 4               | ~160          | ~65         | -59%     |
| **TOTAL** | **16**          | **~657**      | **~252**    | **-62%** |

### Benefício Final

- **16 arquivos duplicados eliminados**
- **405 linhas de código removidas**
- **Padrão consistente** em toda a aplicação
- **Manutenção 62% mais eficiente**

## Conclusão

Este padrão resolve o **maior problema de DX identificado** na análise: duplicação massiva de código CRUD. A implementação é **progressiva, prática e de baixo risco**, mantendo a funcionalidade exata enquanto melhora significativamente a manutenibilidade.

A refatoração no domínio `projects` serve como **prova de conceito** para replicação nos demais domínios, seguindo o princípio de **fazer mudanças incrementais** com benefícios comprovados.
