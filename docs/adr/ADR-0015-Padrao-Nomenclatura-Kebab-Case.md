# ADR-0015: Padrão de nomenclatura de arquivos - kebab-case

## Status

- 🟢 **Aceito**

---

## Contexto

Durante a refatoração alinhada ao Clean Code e Clean Architecture, foi identificado que a nomenclatura dos arquivos estava inconsistente, misturando PascalCase, camelCase, snake_case e kebab-case. Para garantir consistência, legibilidade e facilidade de navegação, decidiu-se adotar um padrão único para todo o projeto.

---

## Decisão

Todos os arquivos do projeto devem seguir o padrão **kebab-case**:
- Letras minúsculas
- Palavras separadas por hífens (`-`)
- Extensões mantidas (`.ts`, `.tsx`, `.json`, etc.)

**Exemplos:**

| Antes                      | Depois                       |
|----------------------------|------------------------------|
| `ModelSettings.tsx`        | `model-settings.tsx`         |
| `useRepositorySettings.ts` | `use-repository-settings.ts` |
| `PromptManager.tsx`        | `prompt-manager.tsx`         |
| `github_token_manager.tsx` | `github-token-manager.tsx`   |

---

## Consequências

**Positivas:**
- Consistência visual em todo o projeto
- Facilidade de leitura e navegação
- Padrão amplamente utilizado em projetos JavaScript/TypeScript modernos
- Evita confusão entre nomes de arquivos e nomes de classes, componentes ou funções
- Melhora a integração com ferramentas, scripts e automações

**Negativas:**
- Todos os arquivos existentes deverão ser renomeados para kebab-case
- Todas as importações e exportações deverão ser atualizadas para refletir os novos nomes
- Documentação e exemplos devem ser atualizados para refletir o padrão

---

## Alternativas Consideradas

- **Manter nomenclatura mista** — rejeitado por dificultar manutenção e leitura.
- **Adotar outro padrão (PascalCase, snake_case)** — rejeitado por não ser o padrão mais comum em projetos modernos de frontend.

---

## Links Relacionados

- [ISSUE-0187 - Padronizar nomenclatura de arquivos](../../issues/backlog/improvement/ISSUE-0187-Nomes-fora-do-padrao-kebab-case/README.md)