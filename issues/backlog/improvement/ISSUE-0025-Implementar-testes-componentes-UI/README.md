# Implementar testes para componentes UI

## Descrição

Atualmente o projeto possui vários componentes React na pasta `src/client/components` mas não há testes implementados para eles. Esta issue visa implementar testes unitários e de integração para os componentes UI seguindo a estratégia de testes do projeto.

## Contexto

- A estratégia de testes define uso de Jest + Testing Library
- Cobertura mínima alvo de 80% para testes unitários
- Componentes críticos devem ter snapshots e testes de interação
- Configuração atual do Jest precisa ser atualizada para suportar testes de React

## Componentes Prioritários

1. **Componentes principais:**

   - `dashboard.tsx` (página principal)
   - `model-card/` (ModelActions, ModelStatusBadge)
   - `model-list/` (ModelList, ModelItem)
   - `providers/theme.tsx`

2. **Componentes UI básicos:**
   - `button.tsx`
   - `form.tsx`
   - `input.tsx`
   - `dialog.tsx`

## Tipos de Testes

Para cada componente:

1. **Testes unitários básicos**

   - Renderização básica
   - Props básicas
   - Estados iniciais

2. **Testes de interação**

   - Event handlers (clicks, changes)
   - Formulários
   - Toggles e estados

3. **Snapshot tests**

   - Para componentes estáticos
   - Para variações de estado

4. **Testes de acessibilidade**
   - Verificar atributos ARIA
   - Navegação por teclado

## Configurações Necessárias

1. Atualizar `jest.config.ts` para:

   - Suportar React Testing Library
   - Configurar ambiente jsdom
   - Adicionar setup para jest-dom

2. Instalar dependências:
   - @testing-library/react
   - @testing-library/jest-dom
   - @testing-library/user-event

## Critérios de Aceitação

- [ ] 80%+ de cobertura para componentes prioritários
- [ ] Snapshots para componentes estáticos
- [ ] Testes de interação para componentes dinâmicos
- [ ] Configuração do Jest atualizada
- [ ] Pipeline CI executando os novos testes

## Tasks

1. [ ] Atualizar configuração do Jest
2. [ ] Implementar testes para dashboard.tsx
3. [ ] Implementar testes para model-card/
4. [ ] Implementar testes para model-list/
5. [ ] Implementar testes para componentes UI básicos
6. [ ] Adicionar snapshots para componentes estáticos
7. [ ] Configurar relatório de cobertura
8. [ ] Atualizar documentação de testes

## Referências

- [Estratégia de Testes](/docs/testing-strategy.md)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro)
