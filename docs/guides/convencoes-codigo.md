# Convenções de Código

## Padrões Gerais
1. **ESLint/Prettier**: Configurações padrão no `.eslintrc.json`
2. **Nomenclatura**:
   - Variáveis: `camelCase`
   - Tipos/Interfaces: `PascalCase`
   - Constantes: `UPPER_CASE`

## TypeScript
1. **Tipagem**:
   - Sempre definir tipos de retorno
   - Usar `interface` para objetos complexos
   - Evitar `any`

2. **Exemplo**:
```typescript
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // implementação
}
```

## React/Componentes
1. **Estrutura**:
   - Um componente por arquivo
   - Nome do arquivo igual ao componente
   - Props tipadas com `interface`

2. **Exemplo**:
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

export function Button({ variant = 'primary', onClick }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}
```

## Testes
1. **Estrutura**:
   - Arquivos de teste junto ao código
   - Padrão: `*.test.ts` ou `*.spec.ts`
   - Descrição clara dos casos

2. **Exemplo**:
```typescript
describe('Button component', () => {
  it('renders primary variant by default', () => {
    render(<Button onClick={jest.fn()} />)
    expect(screen.getByRole('button')).toHaveClass('btn-primary')
  })
})
```

## Estilização
1. **Tailwind CSS**:
   - Classes utilitárias preferidas
   - Customizações via `tailwind.config.js`

2. **CSS Modules**:
   - Nomes de classes em kebab-case
   - Um arquivo por componente

## Histórico de Versões
| Versão | Data       | Mudanças          |
|--------|------------|-------------------|
| 1.0.0  | 2025-04-17 | Versão inicial    |

## Links Relacionados
- [Guia de Desenvolvimento](../development.md)
- [Fluxo Git](../guides/fluxo-git.md)