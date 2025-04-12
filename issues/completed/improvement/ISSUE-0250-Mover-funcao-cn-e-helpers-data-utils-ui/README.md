# Mover função cn e helpers de data de utils.ts para utilitários de UI

## Tipo

improvement

## Descrição

O arquivo `src/client/lib/utils.ts` atualmente contém a função `cn` (responsável por mesclar classes Tailwind) e helpers de formatação de data/hora. Ambos são utilitários específicos de UI e não devem estar disponíveis para outras camadas da aplicação.

**Conforme o ADR-0012 (Clean Architecture),** utilitários de UI devem ser isolados em um diretório próprio, por exemplo, `src/client/utils/ui/`, evitando uso indevido em camadas de domínio, aplicação ou infraestrutura.

### Escopo

- Identificar e mover a função `cn` e todos os helpers de data/hora relacionados à UI do arquivo `src/client/lib/utils.ts` para um novo diretório de utilitários de UI (`src/client/utils/ui/`).
- Garantir que nenhum helper de UI permaneça acessível fora do escopo de apresentação.
- Atualizar imports nos arquivos que utilizam esses utilitários.
- Remover duplicidades e garantir rastreabilidade das mudanças.

### Rastreabilidade

- **Regras do projeto:** Clean Code, Clean Architecture (ver ADR-0012), separação de responsabilidades, evitar dependências cruzadas entre camadas.
- **Referências:**  
  - [ADR-0012 - Clean Architecture para módulos LLM](../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
  - [Regras do projeto](../../../.roo/rules/rules.md)

### Critérios de Aceite

- Função `cn` e helpers de data/hora estão isolados em utilitários de UI.
- Imports atualizados e sem referências cruzadas indevidas.
- Documentação e rastreabilidade das alterações garantidas.