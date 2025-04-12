# ISSUE-0180: Refatorar componente `model-status` para Clean Architecture e Testabilidade

## Contexto

O componente `src/client/components/model-status.tsx` apresenta problemas de acoplamento, dados hardcoded e mistura de responsabilidades, contrariando princípios de Clean Code, Clean Architecture e ADRs do projeto (especialmente ADR-0012 e ADR-0013). A refatoração é necessária para garantir modularidade, manutenibilidade, testabilidade e internacionalização.

## Problemas Identificados

- **Dados hardcoded no componente:** Informações fixas dificultam manutenção e reuso.
- **Mistura de apresentação e definição de dados (SRP):** O componente mistura lógica de obtenção de dados com a camada de apresentação.
- **Acoplamento de dados de domínio na UI:** Viola Clean Architecture ao acessar diretamente dados de domínio na camada de interface.
- **Testabilidade e extensibilidade prejudicadas:** Estrutura atual dificulta testes e adaptação futura, além de não estar preparada para internacionalização.

## Objetivo

Refatorar o componente `model-status` para:

- Eliminar dados hardcoded, recebendo-os via props ou hooks/contextos adequados.
- Separar lógica de obtenção de dados da apresentação (Single Responsibility Principle).
- Alinhar a obtenção de dados com Clean Architecture, evitando acoplamento direto de domínio na UI.
- Tornar o componente testável, extensível e preparado para internacionalização.

## Checklist de Ações

- [ ] Mapear todos os dados hardcoded e definir origem adequada (props, hook, contexto).
- [ ] Extrair lógica de obtenção de dados para hook/contexto ou componente superior.
- [ ] Adaptar o componente para receber apenas dados necessários via props.
- [ ] Garantir que o componente não acesse diretamente dados de domínio.
- [ ] Preparar o componente para internacionalização (i18n).
- [ ] Escrever testes unitários para o componente refatorado.
- [ ] Atualizar documentação e exemplos de uso, se necessário.
- [ ] Validar alinhamento com ADR-0012 (Clean Architecture) e ADR-0013 (dados dinâmicos no dashboard).

## Critérios de Aceite

- O componente não deve conter dados hardcoded.
- Lógica de dados separada da apresentação.
- Pronto para i18n e testável isoladamente.
- Alinhamento com Clean Architecture e ADRs do projeto.

---

## Progresso e Handoff

Utilize o arquivo `handoff.md` nesta pasta para documentar decisões, progresso, dúvidas e próximos passos.