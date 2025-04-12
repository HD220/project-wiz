# ISSUE-0237: Isolar manipulação do DOM de export-history.ts em adaptador de infraestrutura/browser

## Tipo
Improvement

## Descrição

A função `exportDataAsFile` atualmente manipula diretamente o DOM (por exemplo, `document.createElement`, etc.), expondo detalhes de infraestrutura/browser na camada errada. Isso viola os princípios da Clean Architecture definidos no projeto (ver ADR-0012), pois detalhes de implementação de infraestrutura não devem estar presentes nas camadas de aplicação ou domínio.

**Objetivo:**  
Extrair toda a lógica de manipulação do DOM para um adaptador de infraestrutura dedicado, por exemplo, `src/core/infrastructure/browser/file-exporter.ts`. A camada de aplicação deve interagir apenas com uma interface/contrato para exportação de arquivos, sem conhecer detalhes de implementação específicos do browser.

## Critérios de Aceite

- Nenhuma manipulação direta do DOM deve permanecer em `export-history.ts` ou em outras camadas que não sejam de infraestrutura.
- Deve ser criado um adaptador em `src/core/infrastructure/browser/file-exporter.ts` (ou local equivalente), responsável por toda a lógica de exportação de arquivos via browser.
- A interface/contrato de exportação deve ser exposta para uso pelas camadas superiores, conforme Clean Architecture.
- O código deve seguir as regras do projeto e as definições do ADR-0012.

## Rastreabilidade

- **Regra do Projeto:** Detalhes de infraestrutura devem ser isolados em adaptadores específicos, conforme Clean Architecture (ver `.roo/rules/rules.md` e ADR-0012).
- **ADR-0012:** [docs/adr/ADR-0012-Clean-Architecture-LLM.md](../../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
- **Arquivo impactado:** `src/client/hooks/export-history.ts`
- **Exemplo de violação:** Uso de `document.createElement` diretamente fora da infraestrutura.

## Referências

- [Regras do Projeto](../../../../.roo/rules/rules.md)
- [ADR-0012 - Clean Architecture LLM](../../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)