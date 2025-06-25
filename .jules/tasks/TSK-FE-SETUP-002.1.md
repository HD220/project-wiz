# Tarefa: FE-SETUP-002.1-REVISED - Localizar e Analisar Config Shadcn/UI Existente

**ID da Tarefa:** `FE-SETUP-002.1-REVISED`
**Título Breve:** Localizar e Analisar Config Shadcn/UI Existente
**Descrição Completa:**
Investigar a estrutura de diretórios `src/` para localizar a instalação pré-existente da biblioteca Shadcn/UI. Isso inclui encontrar os arquivos `components.json`, o arquivo de configuração do Tailwind CSS (provavelmente `tailwind.config.js` ou `tailwind.config.ts`), e o `globals.css` relevante. Analisar suas configurações atuais, especialmente os `content` paths do Tailwind, os aliases do `components.json` e o tema base, para planejar a migração para a nova estrutura em `src_refactored/presentation/ui/`.

---

**Status:** `Pendente`
**Dependências (IDs):** `FE-SETUP-002`
**Complexidade (1-5):** `1`
**Prioridade (P0-P4):** `P0`
**Responsável:** `Jules`
**Branch Git Proposta:** `feat/fe-migrate-shadcn`
**Commit da Conclusão (Link):**

---

## Critérios de Aceitação
- O arquivo `components.json` original é localizado dentro de `src/`.
- O arquivo `tailwind.config.js` (ou `.ts`) original é localizado.
- O arquivo `globals.css` utilizado pela configuração original do Tailwind é localizado.
- As configurações chave (aliases, paths de conteúdo, tema base do Shadcn, versão do Tailwind) são documentadas/compreendidas.

---

## Notas/Decisões de Design
- Esta tarefa é o primeiro passo para reutilizar a configuração existente do Shadcn/UI, em vez de uma nova instalação.
- Foco em entender como estava configurado para adaptar para `src_refactored/presentation/ui/`.

---

## Comentários
- Tarefa revisada para focar na análise da configuração existente do Shadcn/UI após a instrução do usuário.

---

## Histórico de Modificações da Tarefa (Opcional)
- (Data Atual) Revisada para análise e migração em vez de nova instalação.
