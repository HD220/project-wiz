# Guia de Implementação - [NOME_DA_FEATURE]

**Data de Criação:** [DATA]  
**Última Atualização:** [DATA]  
**Baseado em:** [requirements.md] e [use-cases.md]

---

## Visão Geral da Implementação

### Arquitetura Proposta

[Descrição de alto nível de como a feature se encaixa na arquitetura atual]

### Módulos Afetados

- **[MODULO_1]:** [Tipo de mudança - criação/modificação/extensão]
- **[MODULO_2]:** [Tipo de mudança - criação/modificação/extensão]
- **[MODULO_3]:** [Tipo de mudança - criação/modificação/extensão]

### Padrões Arquiteturais Aplicados

- **DDD (Domain-Driven Design):** [Como aplicar no contexto desta feature]
- **Clean Architecture:** [Separação de camadas e responsabilidades]
- **Repository Pattern:** [Como implementar repositórios necessários]
- **[OUTRO_PADRAO]:** [Como aplicar]

---

## Análise da Codebase Atual

### Código Existente Reutilizável

- **[ARQUIVO/CLASSE_1]:** [Como pode ser reutilizado]
  ```typescript
  // Exemplo de código existente que pode ser aproveitado
  ```
- **[ARQUIVO/CLASSE_2]:** [Como pode ser reutilizado]

### Padrões Identificados

- **Naming Conventions:** [Padrões de nomenclatura observados]
- **Error Handling:** [Como erros são tratados no projeto]
- **Validation:** [Padrões de validação existentes]
- **IPC Communication:** [Como a comunicação main/renderer é feita]

### Pontos de Refatoração Necessários

- **[ARQUIVO_1]:** [O que precisa ser refatorado e por quê]
- **[ARQUIVO_2]:** [O que precisa ser refatorado e por quê]

---

## Implementação Backend (Main Process)

### Estrutura de Domínios (Nova Arquitetura)

```
src/main/domains/[dominio]/
├── entities/
│   ├── [entidade].entity.ts
│   └── [entidade].behaviors.ts
├── value-objects/
│   ├── [value-object].vo.ts
│   └── [value-object].schemas.ts
├── functions/
│   ├── create-[entidade].function.ts
│   ├── find-[entidade].function.ts
│   ├── update-[entidade].function.ts
│   └── delete-[entidade].function.ts
└── types/
    └── [dominio].types.ts
```

### Infraestrutura Transparente

```
src/main/infrastructure/
├── database.ts     # getDatabase() - acesso global ao banco
├── logger.ts       # getLogger(context) - logging global
├── events.ts       # publishEvent() - eventos globais
└── validation.ts   # validate() - validação global
```

### Entidades Ricas (Object Calisthenics)

#### Entidade Principal

```typescript
// Exemplo seguindo Object Calisthenics - máximo 2 variáveis de instância
export class [NomeEntidade] {
  constructor(
    private readonly identity: EntityIdentity,
    private readonly attributes: EntityAttributes
  ) {
    this.validateCreation();
  }

  // Métodos comportamentais (≤10 linhas cada)
  public performAction(): ActionResult {
    if (!this.canPerformAction()) {
      return ActionResult.failure('Cannot perform action');
    }

    const result = this.executeAction();
    publishEvent(new ActionPerformedEvent(this.identity.value));

    return result;
  }

  // Validação como comportamento
  public isValid(): boolean {
    return this.identity.isValid() && this.attributes.areValid();
  }

  // Máximo 1 nível de indentação
  private canPerformAction(): boolean {
    return this.isValid();
  }

  private executeAction(): ActionResult {
    // Lógica específica
    return ActionResult.success();
  }

  private validateCreation(): void {
    if (!this.isValid()) {
      throw new DomainError('Invalid entity state');
    }
  }
}

// Value Objects para encapsular primitivos
export class EntityIdentity {
  constructor(private readonly value: string) {
    const validated = EntityIdSchema.parse(value);
    this.value = validated;
  }

  public getValue(): string {
    return this.value;
  }

  public isValid(): boolean {
    return this.value.length > 0;
  }

  public equals(other: EntityIdentity): boolean {
    return this.value === other.value;
  }
}
```

#### Value Objects Obrigatórios

```typescript
// Todos os primitivos devem ser encapsulados em Value Objects
export class [NomeValueObject] {
  constructor(private readonly value: string) {
    const validated = [Nome]Schema.parse(value);
    this.value = validated;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: [NomeValueObject]): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  // Comportamentos específicos do domínio
  public isValidForOperation(): boolean {
    return this.value.length >= 3;
  }
}

// Schema Zod para validação
export const [Nome]Schema = z.string()
  .min(1, 'Cannot be empty')
  .max(100, 'Too long')
  .refine(val => val.trim().length > 0, 'Cannot be only whitespace');
```

### Funções Simples (Sem Classes de Serviço)

#### Funções CRUD

```typescript
// Funções simples usando infraestrutura transparente
export async function create[NomeEntidade](dados: Create[NomeEntidade]DTO): Promise<[NomeEntidade]> {
  const logger = getLogger('create[NomeEntidade]');

  try {
    // Validação através de Value Objects
    const validatedData = Create[NomeEntidade]Schema.parse(dados);

    // Criar entidade rica
    const entity = new [NomeEntidade](
      new EntityIdentity(generateId()),
      new EntityAttributes(validatedData)
    );

    // Persistir usando infraestrutura transparente
    const db = getDatabase();
    const result = await db.insert([tableName]).values(entity.toSchema()).returning();

    // Publicar evento
    publishEvent(new [NomeEntidade]CreatedEvent(entity.getId()));

    logger.info('[NomeEntidade] created successfully', { id: entity.getId() });

    return [NomeEntidade].fromSchema(result[0]);
  } catch (error) {
    logger.error('Failed to create [NomeEntidade]', { error, dados });
    throw new DomainError('Failed to create [NomeEntidade]');
  }
}

export async function findBy[Criteria](criteria: [Criteria]): Promise<[NomeEntidade][]> {
  const db = getDatabase();
  const logger = getLogger('findBy[Criteria]');

  try {
    const results = await db
      .select()
      .from([tableName])
      .where(buildCriteriaWhere(criteria));

    return results.map([NomeEntidade].fromSchema);
  } catch (error) {
    logger.error('Failed to find [NomeEntidade]', { error, criteria });
    throw new DomainError('Failed to find [NomeEntidade]');
  }
}

// Cada função é focada em uma única responsabilidade
export async function update[NomeEntidade](id: string, updates: Update[NomeEntidade]DTO): Promise<[NomeEntidade]> {
  const entity = await findById(id);
  if (!entity) {
    throw new NotFoundError('[NomeEntidade] not found');
  }

  const updatedEntity = entity.applyUpdates(updates);
  return persistUpdatedEntity(updatedEntity);
}
```

### Schemas e Persistência Simplificada

#### Schema (Drizzle)

```typescript
// Schema continua igual, mas sem Repository classes
export const [nomeTabela]Schema = sqliteTable('[nome_tabela]', {
  id: text('id').primaryKey(),
  propriedade1: text('propriedade1').notNull(),
  propriedade2: integer('propriedade2').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type [NomeEntidade]Schema = typeof [nomeTabela]Schema.$inferSelect;
export type New[NomeEntidade]Schema = typeof [nomeTabela]Schema.$inferInsert;

// Função de conversão para entidade rica
export function schemaTo[NomeEntidade](schema: [NomeEntidade]Schema): [NomeEntidade] {
  return new [NomeEntidade](
    new EntityIdentity(schema.id),
    new EntityAttributes({
      propriedade1: new Propriedade1ValueObject(schema.propriedade1),
      propriedade2: new Propriedade2ValueObject(schema.propriedade2),
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    })
  );
}

export function [nomeEntidade]ToSchema(entity: [NomeEntidade]): New[NomeEntidade]Schema {
  return {
    id: entity.getId(),
    propriedade1: entity.getPropriedade1().getValue(),
    propriedade2: entity.getPropriedade2().getValue(),
    createdAt: entity.getCreatedAt(),
    updatedAt: new Date(),
  };
}
```

#### Acesso Direto ao Banco (Sem Repository Classes)

```typescript
// Acesso direto usando getDatabase() - infraestrutura transparente
import { getDatabase } from '@/main/infrastructure/database';
import { getLogger } from '@/main/infrastructure/logger';

// Funções específicas de persistência quando necessário
export async function persist[NomeEntidade](entity: [NomeEntidade]): Promise<void> {
  const db = getDatabase();
  const logger = getLogger('persist[NomeEntidade]');

  try {
    await db
      .insert([nomeTabela]Schema)
      .values([nomeEntidade]ToSchema(entity))
      .onConflictDoUpdate({
        target: [nomeTabela]Schema.id,
        set: {
          propriedade1: excluded([nomeTabela]Schema.propriedade1),
          propriedade2: excluded([nomeTabela]Schema.propriedade2),
          updatedAt: excluded([nomeTabela]Schema.updatedAt),
        },
      });

    logger.info('[NomeEntidade] persisted', { id: entity.getId() });
  } catch (error) {
    logger.error('Failed to persist [NomeEntidade]', { error, entityId: entity.getId() });
    throw new DomainError('Persistence failed');
  }
}

// Query específicas quando necessário
export async function find[NomeEntidade]ByComplexCriteria(
  criteria: ComplexCriteria
): Promise<[NomeEntidade][]> {
  const db = getDatabase();

  const results = await db
    .select()
    .from([nomeTabela]Schema)
    .where(
      and(
        eq([nomeTabela]Schema.propriedade1, criteria.propriedade1),
        gte([nomeTabela]Schema.createdAt, criteria.dateFrom)
      )
    )
    .orderBy(desc([nomeTabela]Schema.createdAt));

  return results.map(schemaTo[NomeEntidade]);
}
```

### IPC Handlers Simplificados

```typescript
// Handlers chamam funções diretamente - sem classes de service
import { ipcMain } from 'electron';
import {
  create[NomeEntidade],
  findBy[Criteria],
  update[NomeEntidade],
  delete[NomeEntidade]
} from '@/main/domains/[dominio]/functions';

// Setup simples de handlers
export function setup[NomeFeature]Handlers(): void {
  ipcMain.handle('[feature]:create', handleCreate);
  ipcMain.handle('[feature]:findBy', handleFindBy);
  ipcMain.handle('[feature]:update', handleUpdate);
  ipcMain.handle('[feature]:delete', handleDelete);
}

// Handlers como funções simples
async function handleCreate(
  event: Electron.IpcMainInvokeEvent,
  dados: Create[NomeEntidade]DTO
): Promise<[NomeEntidade]Response> {
  try {
    const entity = await create[NomeEntidade](dados);
    return entityToResponse(entity);
  } catch (error) {
    throw new IPCError('Failed to create [NomeEntidade]', error);
  }
}

async function handleFindBy(
  event: Electron.IpcMainInvokeEvent,
  criteria: [Criteria]
): Promise<[NomeEntidade]Response[]> {
  try {
    const entities = await findBy[Criteria](criteria);
    return entities.map(entityToResponse);
  } catch (error) {
    throw new IPCError('Failed to find [NomeEntidade]', error);
  }
}

// Conversão para response DTO
function entityToResponse(entity: [NomeEntidade]): [NomeEntidade]Response {
  return {
    id: entity.getId(),
    propriedade1: entity.getPropriedade1().getValue(),
    propriedade2: entity.getPropriedade2().getValue(),
    createdAt: entity.getCreatedAt(),
    updatedAt: entity.getUpdatedAt(),
  };
}
```

---

## Implementação Frontend (Renderer Process)

### Estrutura de Features

```
src/renderer/features/[nome-feature]/
├── components/
│   ├── [feature]-list.tsx
│   ├── [feature]-item.tsx
│   └── [feature]-form.tsx
├── hooks/
│   ├── use-[feature].hook.ts
│   └── use-[feature]-mutations.hook.ts
├── stores/
│   └── [feature].store.ts
└── types/
    └── [feature].types.ts
```

### Stores (Zustand)

```typescript
// Exemplo de store baseado nos padrões existentes
interface [NomeFeature]Store {
  items: [NomeEntidade][];
  loading: boolean;
  error: string | null;

  // Actions
  fetchItems: () => Promise<void>;
  createItem: (dados: CriarItemDTO) => Promise<void>;
  updateItem: (id: string, dados: AtualizarItemDTO) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Utilities
  resetError: () => void;
  setLoading: (loading: boolean) => void;
}

export const use[NomeFeature]Store = create<[NomeFeature]Store>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const items = await window.electronAPI.[feature].buscarTodos();
      set({ items, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Outros métodos...
}));
```

### Hooks

```typescript
// Exemplo de hook personalizado
export const use[NomeFeature] = () => {
  const store = use[NomeFeature]Store();

  const {
    data: items,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['[feature]', 'list'],
    queryFn: () => window.electronAPI.[feature].buscarTodos(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const createMutation = useMutation({
    mutationFn: (dados: CriarItemDTO) => window.electronAPI.[feature].criar(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[feature]'] });
      toast.success('Item criado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar item: ${error.message}`);
    },
  });

  return {
    items,
    isLoading,
    error,
    refetch,
    createItem: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
};
```

### Componentes

```tsx
// Exemplo de componente baseado nos padrões existentes
export const [NomeFeature]List: React.FC = () => {
  const { items, isLoading, error, refetch } = use[NomeFeature]();

  if (isLoading) {
    return <[NomeFeature]Skeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lista de [Items]</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Novo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <[NomeFeature]Item key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
```

---

## Tratamento de Erros

### Backend Error Handling

```typescript
// Exemplo baseado nos padrões de erro existentes
try {
  // Operação
} catch (error) {
  if (error instanceof ValidationError) {
    throw new ApplicationError("Dados inválidos", error.details);
  } else if (error instanceof NotFoundError) {
    throw new ApplicationError("Item não encontrado");
  } else {
    this.logger.error("Erro inesperado", { error });
    throw new ApplicationError("Erro interno do servidor");
  }
}
```

### Frontend Error Handling

```typescript
// Padrão de tratamento de erro no frontend
const handleError = (error: Error) => {
  console.error("Erro na operação:", error);

  if (error.message.includes("network")) {
    toast.error("Erro de conectividade. Tente novamente.");
  } else if (error.message.includes("validation")) {
    toast.error("Dados inválidos. Verifique os campos.");
  } else {
    toast.error("Erro inesperado. Contate o suporte.");
  }
};
```

---

## Validações

### Backend Validation (Zod)

```typescript
// Exemplo de esquema de validação
export const CriarItemSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  descricao: z.string().optional(),
  valor: z.number().positive("Valor deve ser positivo"),
  categoria: z.enum(["TIPO1", "TIPO2", "TIPO3"]),
});

export type CriarItemDTO = z.infer<typeof CriarItemSchema>;
```

### Frontend Validation (React Hook Form + Zod)

```tsx
// Exemplo de formulário com validação
export const [NomeFeature]Form: React.FC = () => {
  const form = useForm<CriarItemDTO>({
    resolver: zodResolver(CriarItemSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      valor: 0,
      categoria: 'TIPO1',
    },
  });

  const onSubmit = (dados: CriarItemDTO) => {
    createItem(dados);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Outros campos... */}
      </form>
    </Form>
  );
};
```

---

## Testes

### Estrutura de Testes

```
tests/
├── unit/
│   ├── main/
│   │   └── modules/[feature]/
│   └── renderer/
│       └── features/[feature]/
└── integration/
    └── [feature]/
```

### Exemplos de Testes (Vitest)

```typescript
// Teste unitário do service
describe('[NomeFeature]Service', () => {
  let service: [NomeFeature]Service;
  let mockRepository: jest.Mocked<I[NomeFeature]Repository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new [NomeFeature]Service(mockRepository, mockEventBus, mockLogger);
  });

  describe('criarItem', () => {
    it('deve criar item com sucesso', async () => {
      // Arrange
      const dados = { nome: 'Teste', valor: 100 };
      mockRepository.criar.mockResolvedValue(mockItem);

      // Act
      const resultado = await service.criarItem(dados);

      // Assert
      expect(resultado).toEqual(mockItem);
      expect(mockRepository.criar).toHaveBeenCalledWith(expect.any([NomeEntidade]));
    });
  });
});
```

---

## Migrações de Banco

### Migration Script

```sql
-- [DATA]_create_[nome_tabela].sql
CREATE TABLE [nome_tabela] (
  id TEXT PRIMARY KEY,
  propriedade1 TEXT NOT NULL,
  propriedade2 INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_[nome_tabela]_propriedade1 ON [nome_tabela](propriedade1);
```

---

## Considerações de Performance

### Backend

- **Paginação:** [Como implementar para grandes datasets]
- **Cache:** [Estratégias de cache, se necessário]
- **Índices:** [Índices de banco necessários]

### Frontend

- **Virtual Scrolling:** [Para listas grandes]
- **Memoização:** [Componentes que devem ser memoizados]
- **Code Splitting:** [Como dividir o código, se necessário]

---

## Integração com LLMs (se aplicável)

### Configuração

```typescript
// Exemplo de integração com AI SDK
export class [Feature]AIService {
  constructor(private readonly aiService: IAIService) {}

  public async processarComIA(dados: string): Promise<string> {
    const prompt = `Processar dados: ${dados}`;

    const result = await this.aiService.generateText({
      model: 'deepseek-chat',
      prompt,
      maxTokens: 1000,
    });

    return result.text;
  }
}
```

---

## Observações e Constraints

### Limitações Conhecidas

- [Limitação 1 e como contornar]
- [Limitação 2 e como contornar]

### Dependências Críticas

- [Dependência 1 - versão mínima]
- [Dependência 2 - considerações especiais]

### Pontos de Atenção

- [Aspecto que requer cuidado especial]
- [Possíveis armadilhas na implementação]

### Melhorias Futuras

- [Otimizações que podem ser feitas]
- [Funcionalidades que podem ser adicionadas]

---

## Recursos Úteis

### Documentação de Referência

- [Link para doc oficial da biblioteca X]
- [Padrões similares no projeto]

### Arquitetura em Transição

#### Estrutura Atual (A ser migrada)

- `src/main/modules/agent-management/` - Será migrado para `src/main/domains/agents/`
- `src/main/modules/project-management/` - Será migrado para `src/main/domains/projects/`
- `src/renderer/features/direct-messages/` - Será migrado para `src/main/domains/users/`

#### Nova Estrutura de Domínios

- `src/main/domains/projects/` - Container de colaboração e canais
- `src/main/domains/agents/` - Workers autônomos com queue e processamento
- `src/main/domains/users/` - Espaço pessoal, conversas diretas e preferências
- `src/main/domains/llm/` - Infraestrutura de LLM compartilhada
- `src/main/infrastructure/` - Utilitários transparentes (database, logger, events)

#### Padrões de Migração

- **Services → Functions**: Quebrar classes de service em funções específicas
- **Repositories → Direct DB Access**: Usar `getDatabase()` diretamente nas funções
- **DI Container → Transparent Infrastructure**: Substituir injeção por funções globais
- **Anemic Entities → Rich Entities**: Mover comportamento para entidades seguindo Object Calisthenics

### Ferramentas de Desenvolvimento

- [Ferramenta 1 - para que usar]
- [Ferramenta 2 - quando usar]
