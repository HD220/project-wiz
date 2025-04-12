# Dashboard Técnico de Débitos e Melhorias Contínuas

## Resumo dos Débitos Técnicos

| Categoria        | Alto | Médio | Baixo | Total |
|------------------|------|-------|-------|-------|
| Arquitetura      | 4    | 6     | 2     | 12    |
| Qualidade Código | 6    | 8     | 4     | 18    |
| Documentação     | 1    | 2     | 2     | 5     |
| Performance      | 2    | 3     | 1     | 6     |
| Segurança        | 1    | 2     | 1     | 4     |
| **Total**        | 14   | 21    | 10    | 45    |

> **Nota:** Números estimados com base nas issues abertas e concluídas. Atualize conforme evolução do projeto.

---

## Itens de Alta Prioridade

| Item                                                                 | Categoria        | Impacto | Responsável   | Status    | Link Issue                                                                 | Recomendação                      |
|----------------------------------------------------------------------|------------------|---------|---------------|-----------|---------------------------------------------------------------------------|-----------------------------------|
| Centralizar funções utilitárias e evitar duplicidade                 | Qualidade Código | Alto    | Equipe        | Em aberto | [ISSUE-0201](../../issues/backlog/improvement/ISSUE-0201-Consolidar-centralizar-funcoes-utilitarias/) | Consolidar utils em único módulo  |
| Refatorar hooks grandes e duplicados                                 | Qualidade Código | Alto    | Equipe        | Em aberto | [ISSUE-0192](../../issues/backlog/improvement/ISSUE-0192-Hooks-ou-componentes-grandes-refatorar/)     | Modularizar e documentar hooks    |
| Padronizar nomenclatura de arquivos e componentes (kebab-case, inglês)| Arquitetura      | Alto    | Equipe        | Em aberto | [ISSUE-0187](../../issues/backlog/improvement/ISSUE-0187-Nomes-fora-do-padrao-kebab-case/)             | Auditoria e renomeação            |
| Componentes de orquestração crescendo em complexidade                | Arquitetura      | Alto    | Equipe        | Em aberto | [ISSUE-0185](../../issues/backlog/improvement/ISSUE-0185-Componentes-grandes-com-subcomponentes-internos/) | Segregar em subcomponentes        |
| Utilitários dispersos e duplicados                                   | Qualidade Código | Médio   | Equipe        | Em aberto | [ISSUE-0201](../../issues/backlog/improvement/ISSUE-0201-Consolidar-centralizar-funcoes-utilitarias/) | Centralizar e documentar          |
| Hooks fora do diretório correto                                      | Arquitetura      | Médio   | Equipe        | Em aberto | [ISSUE-0186](../../issues/backlog/improvement/ISSUE-0186-Hooks-fora-do-diretorio-correto/)             | Reorganizar estrutura             |
| Mensagens internas fora do padrão (português)                        | Qualidade Código | Médio   | Equipe        | Em aberto | [ISSUE-0188](../../issues/backlog/improvement/ISSUE-0188-Mensagens-internas-em-portugues/)             | Padronizar para inglês            |

---

## Itens Recentemente Endereçados

| Item                                                        | Categoria        | Resolvido em | Link Issue                                                                 | Resolução                                    |
|-------------------------------------------------------------|------------------|--------------|---------------------------------------------------------------------------|-----------------------------------------------|
| Centralização de funções utilitárias                        | Qualidade Código | 2025-04-10   | [ISSUE-0201](../../issues/completed/improvement/ISSUE-0201-Consolidar-centralizar-funcoes-utilitarias/) | Consolidado utils em módulo único            |
| Refatoração de hooks grandes e duplicados                   | Qualidade Código | 2025-03-28   | [ISSUE-0147](../../issues/completed/improvement/ISSUE-0147-Refatorar-hooks-complexos-e-duplicados/)     | Modularização e documentação de hooks         |
| Padronização de nomenclatura (kebab-case)                   | Arquitetura      | 2025-03-15   | [ISSUE-0187](../../issues/completed/improvement/ISSUE-0187-Nomes-fora-do-padrao-kebab-case/)             | Renomeação de arquivos e componentes          |
| Reorganização de hooks para diretório correto               | Arquitetura      | 2025-03-10   | [ISSUE-0186](../../issues/completed/improvement/ISSUE-0186-Hooks-fora-do-diretorio-correto/)             | Estrutura reorganizada                        |
| Remoção de componentes atômicos soltos                      | Arquitetura      | 2025-02-28   | [ISSUE-0190](../../issues/completed/improvement/ISSUE-0190-Componentes-atomicos-soltos/)                 | Componentes agrupados conforme padrão         |

---

## Áreas de Atenção e Oportunidades de Melhoria

- **Crescimento de componentes de orquestração:** Monitorar componentes que concentram múltiplas responsabilidades e segregar em subcomponentes.
- **Centralização de utilitários:** Consolidar funções utilitárias dispersas para evitar duplicidade e facilitar manutenção.
- **Hooks duplicados ou grandes:** Modularizar hooks extensos e eliminar duplicidade, promovendo reutilização.
- **Padronização de nomenclatura:** Garantir uso consistente de kebab-case e inglês em arquivos, funções e mensagens internas.
- **Impactos cruzados em hooks:** Avaliar dependências entre hooks para evitar efeitos colaterais e facilitar testes isolados.
- **Componentes grandes com subcomponentes internos:** Segregar responsabilidades para melhorar legibilidade e manutenção.

---

## Débito Técnico por Componente

| Componente/Área         | Débitos Abertos | Maior Prioridade         |
|------------------------|-----------------|-------------------------|
| Utils (funções utilitárias) | 2               | Centralização           |
| Hooks                  | 3               | Modularização           |
| Prompt Manager         | 2               | Segregação de lógica    |
| Componentes de UI      | 2               | Padronização/Refatoração|
| Orquestração           | 2               | Segregação              |

---

## Plano de Redução de Débito Técnico

1. **Auditoria recorrente:** Revisar periodicamente a estrutura de hooks, utilitários e componentes para identificar duplicidades e violações de padrão.
2. **Padronização de nomenclatura:** Aplicar scripts de verificação e revisão manual para garantir conformidade com kebab-case e inglês.
3. **Segregação de responsabilidades:** Refatorar componentes e hooks grandes, extraindo subcomponentes e funções especializadas.
4. **Centralização de utilitários:** Consolidar funções comuns em módulos únicos, documentando uso e exemplos.
5. **Acompanhamento via issues:** Manter o dashboard atualizado, vinculando sempre as issues relevantes e responsáveis.

> **Recomendações:** Priorizar itens de alto impacto e risco, envolver responsáveis nas revisões e promover cultura de melhoria contínua.

---
