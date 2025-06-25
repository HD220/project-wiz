# Tarefa: FE-COMP-TYPO - Implementar componentes de Tipografia

**ID da Tarefa:** `FE-COMP-TYPO`
**Título Breve:** Implementar componentes de Tipografia (typography/* equivalentes).
**Descrição Completa:**
Reimplementar ou criar um conjunto de componentes de tipografia reutilizáveis, baseados nos estilos definidos no `visual_style_guide.md` e utilizando as classes de utilidade do Tailwind CSS (configurado pelo Shadcn/UI). Isso inclui componentes para títulos (h1-h6), parágrafos, listas, citações, código inline, etc.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002` (Configuração do Shadcn/UI e Tailwind CSS)
**Complexidade (1-5):** `2`
**Prioridade (P0-P4):** `P2` (Consistência visual)
**Responsável:** `Frontend`
**Branch Git Proposta:** `feat/fe-comp-typography`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Componentes de tipografia criados em `src_refactored/presentation/ui/components/common/typography/` (ou local apropriado).
- Componentes para `Blockquote`, `Code` (inline), `Lead` (parágrafo de destaque), `List` (ul, ol), `Paragraph`, `Table` (estilização de tabela tipográfica, se diferente do componente Table do Shadcn), `Titles` (H1, H2, H3, H4, H5, H6).
- Os componentes aplicam as classes Tailwind CSS corretas para corresponder ao guia visual do projeto.
- Os componentes são reutilizáveis e aceitam conteúdo como children.

---

## Notas/Decisões de Design
- `Blockquote`, `Code`, `Lead`, `List`, `Paragraph`, `Table` (typo), `Titles`. (Nota original da tarefa)
- Shadcn/UI já fornece alguns estilos base através do Tailwind, mas componentes explícitos podem ajudar na consistência e semântica. Avaliar o que o Shadcn/UI já oferece para evitar redundância. Por exemplo, o Shadcn já tem componentes como `h1`, `p`, `blockquote`, `list`, `code` que podem ser usados diretamente ou estendidos.

---

## Comentários
- `(Data da migração): Tarefa migrada para novo formato.`

---

## Histórico de Modificações da Tarefa (Opcional)
-
