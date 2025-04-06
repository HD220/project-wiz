# Handoff - Implementar testes para componentes UI

## Configuração Inicial

1. Instalar dependências:

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

2. Atualizar `jest.config.ts`:

```typescript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom", // Alterar de 'node' para 'jsdom'
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
        target: "es5",
      },
    ],
  },
  testMatch: ["**/*.test.ts?(x)"],
  testPathIgnorePatterns: ["/node_modules/"],
};
```

## Estrutura de Pastas

Recomendado criar arquivos de teste junto aos componentes:

```
src/client/components/
  model-card/
    ModelActions.tsx
    ModelActions.test.tsx
    ModelStatusBadge.tsx
    ModelStatusBadge.test.tsx
```

## Exemplos de Testes

### Teste Unitário Básico

```typescript
import { render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### Teste de Interação

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Snapshot Test

```typescript
import { render } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  it("matches snapshot", () => {
    const { container } = render(<Button variant="primary">Save</Button>);
    expect(container).toMatchSnapshot();
  });
});
```

## Boas Práticas

1. **Nomenclatura**:

   - Usar `.test.tsx` para arquivos de teste
   - Manter mesmo nome do componente + `.test.tsx`

2. **Organização**:

   - Agrupar testes por componente
   - Descrever comportamentos com `describe`
   - Usar `it` para casos de teste específicos

3. **Testes de Acessibilidade**:

```typescript
import { render } from "@testing-library/react";
import Button from "./Button";

it("has proper aria attributes", () => {
  render(
    <Button aria-label="Save" disabled>
      Save
    </Button>
  );
  expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
});
```

## Dicas

1. Para componentes que usam temas:

```typescript
import { ThemeProvider } from "../providers/theme";
import { render } from "@testing-library/react";

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};
```

2. Para componentes que usam hooks:

```typescript
import { renderHook } from "@testing-library/react-hooks";
import { useModel } from "../../hooks/useModel";

it("should return initial model state", () => {
  const { result } = renderHook(() => useModel());
  expect(result.current.model).toBeNull();
});
```

## Referências Úteis

- [React Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [User Event Docs](https://testing-library.com/docs/user-event/intro)
