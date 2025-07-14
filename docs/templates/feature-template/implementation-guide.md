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

### Estrutura de Módulos
```
src/main/modules/[nome-feature]/
├── domain/
│   ├── [entidade].entity.ts
│   └── [value-object].vo.ts
├── application/
│   ├── [feature].service.ts
│   └── [use-case].service.ts
├── persistence/
│   ├── [entidade].repository.ts
│   └── [entidade].schema.ts
├── ipc/
│   └── handlers.ts
├── [feature].mapper.ts
└── [feature].module.ts
```

### Domain Layer

#### Entidades
```typescript
// Exemplo de entidade baseada nos padrões do projeto
export class [NomeEntidade] {
  constructor(
    public readonly id: string,
    public readonly propriedade1: string,
    public readonly propriedade2: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // Métodos de negócio
  public metodoNegocio(): void {
    // Lógica de domínio
  }

  // Validações
  public validate(): void {
    // Validações específicas da entidade
  }
}
```

#### Value Objects (se necessários)
```typescript
// Exemplo de value object
export class [NomeValueObject] {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    // Validações específicas
  }

  public getValue(): string {
    return this.value;
  }
}
```

### Application Layer

#### Services
```typescript
// Exemplo de service baseado nos padrões existentes
export class [NomeFeature]Service implements I[NomeFeature]Service {
  constructor(
    private readonly repository: I[NomeFeature]Repository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger
  ) {}

  public async criarItem(dados: CriarItemDTO): Promise<[Entidade]> {
    try {
      // Validações
      // Lógica de negócio
      // Persistência
      // Eventos
      
      this.logger.info('Item criado com sucesso', { id: item.id });
      this.eventBus.emit(new ItemCriadoEvent(item));
      
      return item;
    } catch (error) {
      this.logger.error('Erro ao criar item', { error });
      throw new ApplicationError('Falha na criação do item');
    }
  }
}
```

### Persistence Layer

#### Schema (Drizzle)
```typescript
// Exemplo de schema baseado nos padrões existentes
export const [nomeTabela]Schema = sqliteTable('[nome_tabela]', {
  id: text('id').primaryKey(),
  propriedade1: text('propriedade1').notNull(),
  propriedade2: integer('propriedade2').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type [NomeEntidade]Schema = typeof [nomeTabela]Schema.$inferSelect;
export type New[NomeEntidade]Schema = typeof [nomeTabela]Schema.$inferInsert;
```

#### Repository
```typescript
// Exemplo de repository baseado nos padrões existentes
export class [NomeFeature]Repository implements I[NomeFeature]Repository {
  constructor(private readonly db: DrizzleDB) {}

  public async criar(entidade: [NomeEntidade]): Promise<[NomeEntidade]> {
    const schema = [NomeFeature]Mapper.toSchema(entidade);
    
    const [result] = await this.db
      .insert([nomeTabela]Schema)
      .values(schema)
      .returning();
      
    return [NomeFeature]Mapper.toDomain(result);
  }

  public async buscarPorId(id: string): Promise<[NomeEntidade] | null> {
    const result = await this.db
      .select()
      .from([nomeTabela]Schema)
      .where(eq([nomeTabela]Schema.id, id))
      .limit(1);
      
    return result.length > 0 ? [NomeFeature]Mapper.toDomain(result[0]) : null;
  }
}
```

### IPC Handlers
```typescript
// Exemplo de handlers IPC baseado nos padrões existentes
export class [NomeFeature]Handlers {
  constructor(private readonly service: I[NomeFeature]Service) {}

  public setupHandlers(): void {
    ipcMain.handle('[feature]:criar', this.handleCriar.bind(this));
    ipcMain.handle('[feature]:buscar', this.handleBuscar.bind(this));
    ipcMain.handle('[feature]:atualizar', this.handleAtualizar.bind(this));
    ipcMain.handle('[feature]:deletar', this.handleDeletar.bind(this));
  }

  private async handleCriar(event: Electron.IpcMainInvokeEvent, dados: CriarItemDTO): Promise<[NomeEntidade]> {
    return await this.service.criarItem(dados);
  }
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
    throw new ApplicationError('Dados inválidos', error.details);
  } else if (error instanceof NotFoundError) {
    throw new ApplicationError('Item não encontrado');
  } else {
    this.logger.error('Erro inesperado', { error });
    throw new ApplicationError('Erro interno do servidor');
  }
}
```

### Frontend Error Handling
```typescript
// Padrão de tratamento de erro no frontend
const handleError = (error: Error) => {
  console.error('Erro na operação:', error);
  
  if (error.message.includes('network')) {
    toast.error('Erro de conectividade. Tente novamente.');
  } else if (error.message.includes('validation')) {
    toast.error('Dados inválidos. Verifique os campos.');
  } else {
    toast.error('Erro inesperado. Contate o suporte.');
  }
};
```

---

## Validações

### Backend Validation (Zod)
```typescript
// Exemplo de esquema de validação
export const CriarItemSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  descricao: z.string().optional(),
  valor: z.number().positive('Valor deve ser positivo'),
  categoria: z.enum(['TIPO1', 'TIPO2', 'TIPO3']),
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

### Exemplos no Código Atual
- `src/main/modules/agent-management/` - [O que pode ser aproveitado]
- `src/renderer/features/direct-messages/` - [Padrões de UI similares]

### Ferramentas de Desenvolvimento
- [Ferramenta 1 - para que usar]
- [Ferramenta 2 - quando usar]