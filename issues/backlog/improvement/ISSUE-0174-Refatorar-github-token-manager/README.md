# Refatorar componente `github-token-manager.tsx` para Clean Code, i18n e desacoplamento

## Contexto

O componente `src/client/components/github-token-manager.tsx` está funcional, porém apresenta violações de princípios de Clean Code, Clean Architecture e ADRs do projeto. Foram identificados problemas de clareza, acoplamento excessivo, ausência de internacionalização e uso inadequado de integrações com Electron.

Além disso, o componente centraliza múltiplas responsabilidades: gerencia estado interno, executa validação, realiza operações de salvamento/remoção e exibe o token na interface. Essa concentração de responsabilidades dificulta a manutenção, a testabilidade e a evolução do código, violando o princípio da responsabilidade única (SRP).

A refatoração é necessária para garantir clareza, manutenibilidade, internacionalização e desacoplamento de infraestrutura, alinhando o componente aos padrões estabelecidos no projeto.

## Problemas Identificados

- O componente principal possui múltiplas responsabilidades: gerenciamento de estado, validação, salvamento, remoção e exibição do token.
- Nomes pouco descritivos (`fetchStatus`, `isSaved`).
- Mistura de lógica de UI, validação e integração com Electron.
- Mensagens duplicadas e hardcoded, em português.
- Acesso direto à API global do Electron.
- Falta de internacionalização (i18n) nos textos de UI.

## Objetivos da Refatoração

- Segregar responsabilidades, extraindo a lógica de estado e efeitos para hooks ou utilitários dedicados, melhorando SRP e testabilidade.
- Tornar os nomes de variáveis e funções mais descritivos e alinhados ao domínio.
- Extrair integração com Electron para hook/serviço dedicado (ex: `useGitHubToken`).
- Extrair validação para utilitário externo.
- Centralizar mensagens em constantes, converter para inglês e integrar i18n.
- Abstrair acesso à API do Electron, mantendo o componente desacoplado.
- Integrar sistema de i18n para todos os textos de UI.

## Checklist de Ações

- [ ] Segregar lógica de estado e efeitos em hooks/utilitários dedicados.
- [ ] Renomear variáveis e funções para nomes descritivos (ex: `fetchGitHubTokenStatus`, `isTokenSaved`).
- [ ] Extrair integração com Electron para hook/serviço dedicado.
- [ ] Extrair validação para utilitário externo.
- [ ] Centralizar mensagens em constantes, converter para inglês e integrar ao sistema de i18n.
- [ ] Remover textos hardcoded em português do componente.
- [ ] Abstrair acesso à API global do Electron.
- [ ] Garantir que todos os textos de UI estejam internacionalizados.
- [ ] Atualizar testes e documentação conforme necessário.

## Referências

- ADR-0012: Clean Architecture para módulos LLM.
- ADR-0005: Estrutura de pastas Electron.
- SDR-0001: Código-fonte em inglês.
- docs/i18n-guide.md

## Progresso e Handoff

Utilize o arquivo `handoff.md` nesta pasta para documentar decisões, progresso, dificuldades e próximos passos durante a execução da refatoração.