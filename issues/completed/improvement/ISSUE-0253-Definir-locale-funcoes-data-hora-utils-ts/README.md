# Definir locale explicitamente nas funções de data/hora em utils.ts

## Tipo

improvement

## Contexto e Problema

Atualmente, as funções `formatDate` e `formatDateTime` localizadas em `src/client/lib/utils.ts` utilizam os métodos `toLocaleDateString` e `toLocaleTimeString` do JavaScript sem especificar explicitamente o parâmetro de locale. Isso pode gerar inconsistências na formatação de datas e horas, pois o resultado depende do ambiente e das configurações regionais do sistema operacional do usuário.

Essa ausência de padronização pode causar problemas de previsibilidade na interface, dificultando testes automatizados, manutenção e experiência do usuário, especialmente em ambientes multi-plataforma ou internacionalizados.

## Objetivo

Definir explicitamente o locale (por exemplo, `"en-US"`) nas chamadas a `toLocaleDateString` e `toLocaleTimeString` nas funções `formatDate` e `formatDateTime` em `src/client/lib/utils.ts`, garantindo previsibilidade, padronização e aderência aos princípios de clean code.

## Escopo

- Atualizar as funções `formatDate` e `formatDateTime` para sempre informar o locale explicitamente.
- Garantir que a escolha do locale seja consistente com o padrão do projeto.
- Documentar a decisão no código, se necessário.

## Rastreabilidade e Referências

- **Arquivo alvo:** `src/client/lib/utils.ts`
- **Funções afetadas:** `formatDate`, `formatDateTime`
- **Regras e princípios:**
  - [Clean Code Principles](../../../../.roo/rules/rules.md#7-clean-code-principles): previsibilidade, clareza e padronização.
  - [ADR-0012 - Clean Architecture](../../../../docs/adr/ADR-0012-Clean-Architecture-LLM.md)
  - [SDR-0001 - Código-fonte em inglês](../../../../docs/sdr/SDR-0001-Codigo-Fonte-Em-Ingles.md)
- **Motivação:** Evitar inconsistências de formatação e garantir comportamento previsível e testável.

## Critérios de Aceite

- As funções `formatDate` e `formatDateTime` devem utilizar um locale explícito.
- O comportamento deve ser consistente em diferentes ambientes.
- O código deve permanecer simples, legível e alinhado ao padrão do projeto.