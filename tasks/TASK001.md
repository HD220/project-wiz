# TASK001: Criar Estrutura Base do Core

## 📋 Descrição da Tarefa

Criar a estrutura básica da pasta `core/` e implementar as abstrações fundamentais que serão utilizadas por todos os módulos do sistema.

## 🎯 Objetivo

Estabelecer as bases arquiteturais do sistema criando interfaces e contratos que definirão como os componentes irão interagir entre si.

## 📦 Dependências

- **Nenhuma** - Esta é a primeira tarefa da refatoração

## 🔧 O que deve ser feito

### 1. Criar estrutura de pastas

```
src/main/core/
├── abstractions/
├── base/
├── infrastructure/
├── errors/
└── shared/
```

### 2. Implementar interfaces básicas

Criar as seguintes interfaces em `core/abstractions/`:
- `IRepository<T, ID>` - Contrato para repositórios
- `IService<T>` - Contrato para serviços
- `IMapper<Domain, Dto>` - Contrato para mappers
- `IValidator<T>` - Contrato para validadores
- `IQuery<T>` - Contrato para queries (CQRS)
- `ICommand<T>` - Contrato para commands (CQRS)

### 3. Criar tipos básicos

Em `core/abstractions/`, criar:
- `Result<T, E>` - Tipo para representar sucesso/erro
- `Entity` - Tipo base para entidades
- `ValueObject` - Tipo base para value objects
- `DomainEvent` - Tipo base para eventos de domínio

## 🎯 Como fazer

### Estrutura de Arquivos

1. **Criar pasta core**:
   ```bash
   mkdir -p src/main/core/{abstractions,base,infrastructure,errors,shared}
   ```

2. **Criar arquivo de índice** em `core/abstractions/index.ts` para centralizar exports

3. **Implementar interfaces seguindo padrões TypeScript**:
   - Use generics para flexibilidade
   - Mantenha interfaces pequenas e focadas
   - Documente com TSDoc quando necessário

### Padrões a Seguir

- **Nomenclatura**: Interfaces começam com `I` (IRepository, IService)
- **Generics**: Use `<T>` para tipos, `<TId>` para IDs
- **Imutabilidade**: Prefira `readonly` em propriedades
- **Documentação**: Use JSDoc para interfaces públicas

## 🔍 O que considerar

### Princípios SOLID

- **SRP**: Cada interface deve ter uma única responsabilidade
- **ISP**: Interfaces pequenas e específicas
- **DIP**: Dependa de abstrações, não de implementações

### Boas Práticas

- **Type Safety**: Use TypeScript rigorosamente
- **Extensibilidade**: Interfaces devem ser extensíveis
- **Consistência**: Padrões consistentes de nomenclatura
- **Documentação**: Interfaces bem documentadas

### Considerações Técnicas

- **Performance**: Interfaces não afetam runtime
- **Manutenibilidade**: Mudanças em interfaces afetam implementações
- **Reutilização**: Interfaces facilitam reutilização

## ✅ Definição de Pronto

A tarefa estará completa quando:

1. ✅ Estrutura de pastas `core/` criada
2. ✅ Todas as interfaces básicas implementadas
3. ✅ Tipos básicos criados (Result, Entity, ValueObject, DomainEvent)
4. ✅ Arquivo index.ts criado com exports organizados
5. ✅ Documentação JSDoc adicionada às interfaces principais
6. ✅ Comandos de qualidade executados sem erros

## 🧪 Checklist de Validação

### Estrutura de Arquivos
- [ ] Pasta `src/main/core/` criada
- [ ] Subpastas `abstractions/`, `base/`, `infrastructure/`, `errors/`, `shared/` criadas
- [ ] Arquivo `core/abstractions/index.ts` criado

### Interfaces Implementadas
- [ ] `IRepository<T, ID>` com métodos básicos CRUD
- [ ] `IService<T>` com métodos de negócio
- [ ] `IMapper<Domain, Dto>` com métodos de conversão
- [ ] `IValidator<T>` com método validate
- [ ] `IQuery<T>` para consultas CQRS
- [ ] `ICommand<T>` para comandos CQRS

### Tipos Básicos
- [ ] `Result<T, E>` implementado
- [ ] `Entity` base definida
- [ ] `ValueObject` base definida
- [ ] `DomainEvent` base definida

### Qualidade do Código
- [ ] `npm run format` executado sem erros
- [ ] `npm run lint` executado sem erros
- [ ] `npm run type-check` executado sem erros
- [ ] Documentação JSDoc adicionada
- [ ] Exports organizados no index.ts

### Validação
- [ ] Interfaces compilam sem erros
- [ ] Todos os tipos são válidos
- [ ] Exports funcionam corretamente

## 🚨 Critérios de Aceitação

### Obrigatórios
- **Compilação**: Código compila sem erros TypeScript
- **Linting**: Sem warnings de ESLint
- **Formatação**: Código formatado corretamente
- **Estrutura**: Pastas e arquivos na estrutura correta

### Desejáveis
- **Documentação**: Interfaces documentadas com JSDoc
- **Consistência**: Padrões consistentes de nomenclatura
- **Extensibilidade**: Interfaces facilmente extensíveis

## 📝 Observações

- Esta tarefa estabelece as **fundações** do sistema
- Mudanças aqui **impactam todo o sistema**
- Foque em **simplicidade e clareza**
- **Não implemente** lógica de negócio nesta etapa
- Mantenha interfaces **pequeanas e focadas**

## 🔄 Próxima Tarefa

**TASK002**: Implementar Classes Base e Abstratas - Depende desta tarefa estar 100% completa