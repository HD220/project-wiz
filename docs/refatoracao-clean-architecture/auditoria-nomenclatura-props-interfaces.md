# Auditoria e Padronização de Nomenclatura — Props e Interfaces

## Contexto

Esta auditoria foi realizada como parte da **ISSUE-0184** para identificar e padronizar nomes de props e interfaces em componentes e hooks relacionados à lista de arquivos/documentação. O objetivo é garantir clareza, consistência e alinhamento com as [ADRs](../adr/README.md) e [SDRs](../sdr/README.md) do projeto, promovendo código mais legível e de fácil manutenção.

---

## Problemas Identificados

Foram encontrados nomes genéricos, inconsistentes ou abreviados em props e parâmetros, dificultando o entendimento do domínio e violando princípios de Clean Code e as decisões do projeto.

### Exemplos de nomes problemáticos

| Nome Atual      | Problema                                 | Contexto/Exemplo de Uso         |
|-----------------|------------------------------------------|---------------------------------|
| `docs`          | Genérico, não indica tipo                | Lista de arquivos/documentos    |
| `doc`           | Genérico, não indica tipo                | Item individual                 |
| `selectedFile`  | Pouco específico                         | Pode ser caminho ou id          |
| `onSelect`      | Genérico, não indica o que é selecionado | Seleção de arquivo/item         |
| `onSelectItem`  | Genérico, pouco padronizado              | Seleção em listas               |
| `initialSelected`| Pouco claro                             | Seleção inicial                 |
| `file`          | Genérico, ambíguo                        | Parâmetro de função/prop        |
| `path`          | Genérico, não padronizado                | Parâmetro de função/prop        |
| `[key: string]: any` | Permissivo, mas necessário           | Props de navegação              |

---

## Referências a ADRs/SDRs

- **SDR-0001:** [Código-fonte em inglês](../sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md)
- **ADR-0015:** [Padrão de nomenclatura kebab-case para arquivos](../adr/ADR-0015-Padrao-Nomenclatura-Kebab-Case.md)
- **Clean Code:** Nomes devem ser descritivos e revelar intenção

---

## Plano de Padronização

A tabela abaixo apresenta a proposta de padronização para os principais nomes identificados:

| Nome Atual      | Nome Padronizado         | Justificativa                        |
|-----------------|-------------------------|--------------------------------------|
| `docs`          | `fileList` ou `documentList` | Especifica o tipo de lista           |
| `doc`           | `file` ou `document`    | Especifica o tipo de item            |
| `selectedFile`  | `selectedFilePath` ou `selectedFileId` | Especifica o que está selecionado    |
| `onSelect`      | `onFileSelect` ou `onFilePathSelect`   | Especifica o evento de seleção       |
| `onSelectItem`  | `onItemSelect`          | Padronização para listas genéricas   |
| `initialSelected`| `initialSelectedFilePath` | Especifica o valor inicial           |
| `file`          | `filePath` ou `fileId`  | Especifica o tipo de referência      |
| `path`          | `filePath`              | Padronização de nomenclatura         |

> **Nota:** A escolha entre `file` e `document` deve seguir o domínio:  
> - Use `file` para arquivos do sistema  
> - Use `document` para entidades lógicas/documentos

---

## Justificativa Técnica

- **Clareza:** Nomes descritivos facilitam o entendimento do código.
- **Consistência:** Reduz ambiguidade e erros de integração entre componentes/hooks.
- **Manutenção:** Facilita refatorações futuras e onboarding de novos desenvolvedores.
- **Alinhamento:** Segue Clean Code, ADRs e SDRs do projeto.

---

## Orientações para Refatoração

- Atualizar todas as interfaces, props e parâmetros conforme o plano acima.
- Revisar todos os arquivos dependentes para garantir consistência.
- Atualizar exemplos de uso e documentação técnica.
- Documentar exceções e casos onde `[key: string]: any` é necessário, justificando seu uso.

---

## Documentos Relacionados

- [ISSUE-0184 - Refatorar documentation-file-list: acessibilidade, i18n, clean architecture](../../../issues/backlog/improvement/ISSUE-0184-Refatorar-documentation-file-list-acessibilidade-i18n-clean-architecture/handoff.md)
- [ADRs do Projeto](../adr/README.md)
- [SDRs do Projeto](../sdr/README.md)

---

*Este documento deve ser revisado e atualizado conforme a evolução da refatoração e novas decisões de arquitetura.*