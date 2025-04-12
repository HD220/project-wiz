# ISSUE-0171: Exibir mensagem amigável quando lista de arquivos estiver vazia (`file-list.tsx`)

## Contexto

O componente `src/client/components/file-list.tsx` atualmente não exibe nenhuma mensagem quando a lista de arquivos (`docs`) está vazia. Isso pode gerar incerteza para o usuário, que não sabe se houve erro, se está carregando ou se realmente não há arquivos.

A melhoria sugerida visa aprimorar a experiência do usuário em edge cases, exibindo uma mensagem clara e amigável quando não houver arquivos a serem listados.

- **Trecho relevante:** Linhas 15-22 do arquivo.
- **Recomendação:** Adicionar um condicional para mostrar, por exemplo, `<div>No files found.</div>` quando `docs.length === 0`.

## Objetivo

Melhorar a experiência do usuário ao informar explicitamente quando não há arquivos disponíveis na lista, tornando o comportamento do componente mais previsível e acessível.

## Critérios de Aceite

- Quando `docs.length === 0`, deve ser exibida uma mensagem amigável ao usuário.
- A mensagem deve ser clara, sucinta e seguir o padrão visual do projeto.
- O restante do comportamento do componente deve permanecer inalterado.
- O código deve manter conformidade com Clean Code, Clean Architecture e ADRs do projeto.
- A solução deve ser facilmente testável.

## Checklist de Ações

- [ ] Analisar o componente `file-list.tsx` e identificar o ponto de inserção do condicional.
- [ ] Adicionar condicional para exibir mensagem quando a lista estiver vazia.
- [ ] Garantir que a mensagem siga o padrão visual e de acessibilidade do projeto.
- [ ] Revisar e testar o comportamento do componente após a alteração.
- [ ] Atualizar documentação e exemplos, se necessário.
- [ ] Registrar progresso e decisões no `handoff.md`.

## Observações

- Melhoria opcional, sem impacto em regras de negócio ou arquitetura.
- Não há dependências externas ou riscos relevantes.
- Recomenda-se envolver revisão de UX/UI se houver dúvidas sobre o texto ou estilo da mensagem.