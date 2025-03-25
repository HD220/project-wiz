# Estratégia de Testes

## 1. Tipos de Testes

### Testes Unitários

- Foco em componentes e funções individuais
- Isolamento de dependências externas
- Cobertura de casos de uso e edge cases

### Testes de Integração

- Verificação da comunicação entre módulos
- Testes de fluxos completos
- Validação de integração com APIs externas

### Testes E2E (End-to-End)

- Simulação de interações do usuário
- Testes de interface gráfica
- Validação de fluxos completos da aplicação

## 2. Estrutura de Diretórios

```
tests/
  ├── unit/
  │   ├── components/
  │   ├── hooks/
  │   └── lib/
  ├── integration/
  │   ├── api/
  │   └── modules/
  └── e2e/
      ├── flows/
      └── pages/
```

## 3. Ferramentas Recomendadas

- **Vitest**: Testes unitários e de integração
- **Playwright**: Testes E2E
- **MSW**: Mock de APIs
- **Testing Library**: Testes de componentes React

## 4. Padrões para Escrita de Testes

### Nomenclatura

- Arquivos: [nome].test.ts
- Suites: describe('Módulo/Funcionalidade')
- Casos: it('deve [comportamento esperado]')

### Estrutura

1. Setup: Preparação do ambiente
2. Execução: Chamada da função/componente
3. Assertions: Verificação dos resultados

### Boas Práticas

- Testes independentes e isolados
- Descrições claras e específicas
- Cobertura de casos positivos e negativos
- Uso de mocks para dependências externas

## 5. Exemplos de Casos de Teste

### Teste Unitário (Componente)

```typescript
import { render, screen } from "@testing-library/react";
import Button from "@/components/ui/button";

describe("Button Component", () => {
  it("deve renderizar o texto corretamente", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### Teste de Integração (API)

```typescript
import { test, expect } from "vitest";
import { downloadModel } from "@/core/llama/download";

test("deve baixar o modelo com sucesso", async () => {
  const result = await downloadModel("model-id");
  expect(result).toBeTruthy();
});
```

### Teste E2E (Fluxo Completo)

```typescript
import { test, expect } from "@playwright/test";

test("deve completar o download do modelo", async ({ page }) => {
  await page.goto("/models");
  await page.click("text=Download");
  await expect(page.locator(".progress-bar")).toBeVisible();
});
```

## 6. Cobertura de Testes

- Mínimo de 80% para código crítico
- 100% para componentes principais
- Relatório de cobertura gerado automaticamente

## 7. Execução de Testes

### Comandos

- `npm test`: Executa todos os testes
- `npm test:unit`: Apenas testes unitários
- `npm test:integration`: Testes de integração
- `npm test:e2e`: Testes end-to-end

### CI/CD

- Execução automática em pull requests
- Bloqueio de merge em caso de falha
- Relatório de cobertura obrigatório
