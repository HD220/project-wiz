# Tarefa: RESEARCH-TAILWINDVITE-001 - Pesquisar necessidade de `tailwind.config.ts` com `@tailwindcss/vite` v4.x

**ID da Tarefa:** `RESEARCH-TAILWINDVITE-001`
**Título Breve:** Pesquisar necessidade de `tailwind.config.ts` com `@tailwindcss/vite` v4.x
**Descrição Completa:**
Pesquisar a documentação oficial do `@tailwindcss/vite` e do Tailwind CSS v4, além de discussões da comunidade (GitHub issues, Stack Overflow) para determinar se um arquivo `tailwind.config.ts` (ou `.js`) é estritamente necessário para o plugin `@tailwindcss/vite` (especificamente para a configuração `content`) ao usar Tailwind CSS v4. O projeto usa `@tailwindcss/vite` v4.1.10 e `tailwindcss` v4.0.14.

---

**Status:** `Pendente`
**Dependências (IDs):** -
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `docs/tailwind-vite-research`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- Resposta clara (sim/não/depende) sobre a necessidade do arquivo de configuração `tailwind.config.ts` para o plugin `@tailwindcss/vite` no contexto do Tailwind CSS v4, especialmente para a diretiva `content`.
- Referências para as fontes da documentação oficial ou discussões relevantes da comunidade que suportam a conclusão.
- Resultado da pesquisa documentado em um novo arquivo markdown em `docs/dev-notes/tailwind-vite-config-research.md`.
- Link para o novo arquivo de documentação adicionado como comentário na tarefa (no arquivo `TASKS.md` ou neste detalhe).

---

## Notas/Decisões de Design
- A conclusão desta pesquisa impactará a decisão de manter ou remover o arquivo `tailwind.config.ts` recriado na tarefa `FE-SETUP-002.3-REVISED`.
- O projeto atualmente utiliza o plugin `@tailwindcss/vite` conforme especificado em `vite.renderer.config.mts`.

---

## Comentários
- Criada para esclarecer uma dúvida do usuário sobre a configuração do Tailwind CSS v4 com Vite.

---

## Histórico de Modificações da Tarefa (Opcional)
- (Data Atual) Tarefa criada.
