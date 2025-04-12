# Separar dados de navegação de apresentação em sidebar-items.tsx (remover JSX dos utilitários)

## Tipo

improvement

## Descrição

O arquivo `src/client/lib/sidebar-items.tsx` atualmente mistura dados de navegação (rotas, nomes) com elementos de UI, como JSX, ícones e funções que retornam JSX. Essa abordagem viola princípios de modularidade e dificulta a testabilidade, além de contrariar a Clean Architecture definida no projeto (ver ADR-0012).

**Objetivo:**  
Refatorar o utilitário para manter apenas dados puros e serializáveis (rotas, nomes, identificadores) em `sidebar-items.tsx`, movendo toda a lógica de apresentação (JSX, ícones, tradução, funções que retornam elementos visuais) para a camada de UI (componentes React).

### Benefícios esperados

- Melhora a modularidade e separação de responsabilidades.
- Facilita a testabilidade dos dados de navegação.
- Reduz o acoplamento entre dados e apresentação.
- Aderência à Clean Architecture (ADR-0012) e às regras do projeto.

### Critérios de aceitação

- `src/client/lib/sidebar-items.tsx` deve conter apenas dados puros e serializáveis.
- Nenhum JSX, ícone ou função que retorna JSX deve permanecer no utilitário.
- Toda lógica de apresentação deve ser movida para componentes de UI.
- O código resultante deve seguir as regras de Clean Code e Clean Architecture do projeto.

### Rastreabilidade

- **Regras do projeto:** Modularidade, separação de responsabilidades, Clean Code (ver `.roo/rules/rules.md` e `.roo/rules-code/rules.md`).
- **ADR-0012:** Clean Architecture para módulos LLM (`docs/adr/ADR-0012-Clean-Architecture-LLM.md`).

---