# Tarefa: FE-COMP-PROJ-CARD - Implementar ProjectCard

**ID da Tarefa:** `FE-COMP-PROJ-CARD`
**Título Breve:** Implementar `ProjectCard` (projects/project-card.tsx equivalente).
**Descrição Completa:**
Reimplementar o componente `ProjectCard` usado para exibir um resumo de um projeto em uma lista de projetos. Este card normalmente mostra o nome do projeto, uma breve descrição, e talvez algumas estatísticas ou um ícone.

---

**Status:** `Em Andamento`
**Dependências (IDs):** `FE-SETUP-002 (Shadcn base)` (Componente Card do Shadcn/UI é usado diretamente)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P1` (Componente chave para listagem de projetos)
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-comp-project-card`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componente `ProjectCard.tsx` criado em `src_refactored/presentation/ui/features/project/components/ProjectCard.tsx`. **(Concluído)**
- Exibe o nome do projeto, descrição, e placeholders para outras informações relevantes (tags, datas, owner, stats). **(Concluído)**
- Utiliza o componente `Card` do Shadcn/UI como base. **(Concluído)**
- O card é clicável e navega para a página de detalhes do projeto correspondente (usando TanStack Router `<Link>` e path parametrizado `/projects/$projectId`). **(Concluído)**

---

## Notas/Decisões de Design
- O componente `ProjectCard` aceita um objeto `ProjectSummary` como prop para exibir os dados.
- A interface `ProjectSummary` foi definida para incluir `id`, `name`, `description`, e campos opcionais como `lastUpdatedAt`, `tags`, `imageUrl`, `starCount`, `forkCount`, e `owner`.
- O card inteiro funciona como um link de navegação.
- Ícones de `lucide-react` são usados para metadados como data e estatísticas.
- Shadcn/UI `Badge` é usado para tags.
- A descrição do projeto utiliza `line-clamp-3` para truncamento.
- Placeholder data for `lastUpdatedAt`, `tags`, `owner`, `starCount`, `forkCount` é usada dentro do componente por enquanto.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`
- `(Data Atual): Implementado o componente ProjectCard.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
