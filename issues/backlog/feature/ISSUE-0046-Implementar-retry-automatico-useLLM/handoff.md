# Handoff Document

## Contexto

A tarefa consiste em implementar um mecanismo de retry automático no hook `useLLM` para aumentar a resiliência do sistema em caso de falhas transitórias nas requisições à LLM.

## Implementação

Será necessário modificar o hook `useLLM` para adicionar a lógica de retry. A implementação deve permitir configurar o número máximo de tentativas e o delay entre elas. Além disso, deve ser implementado um mecanismo para evitar retries em caso de erros não recuperáveis.

## Testes

- [ ] Testar o retry em diferentes cenários de falha (ex: timeout, erro de rede).
- [ ] Verificar se o número máximo de tentativas é respeitado.
- [ ] Verificar se o delay entre as tentativas é correto.
- [ ] Verificar se o mecanismo para evitar retries em erros não recuperáveis funciona corretamente.

## Review Necessário

- [ ] Frontend
- [ ] Backend (se houver alguma alteração no backend para suportar o retry)

## Próximos Passos

- [ ] Implementar a lógica de retry no hook `useLLM`.
- [ ] Adicionar testes unitários para garantir o funcionamento correto do retry.
- [ ] Documentar a implementação do retry no hook `useLLM`.
