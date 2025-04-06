# Implementar retry automático no hook useLLM

## Descrição

Implementar um mecanismo de retry automático no hook `useLLM` para lidar com falhas transitórias nas requisições à LLM. Isso garante maior resiliência e confiabilidade do sistema, evitando que erros temporários interrompam a experiência do usuário.

## Critérios de Aceitação

- [ ] O hook `useLLM` deve tentar novamente a requisição em caso de falha.
- [ ] Deve ser configurável o número máximo de tentativas.
- [ ] Deve ser configurável o delay entre as tentativas.
- [ ] As tentativas devem ser interrompidas caso a requisição seja bem-sucedida.
- [ ] Deve haver um mecanismo para evitar retries em caso de erros não recuperáveis (ex: falta de permissão).

## Tarefas

- [ ] Implementar a lógica de retry no hook `useLLM`.
- [ ] Adicionar parâmetros de configuração para o número máximo de tentativas e o delay entre elas.
- [ ] Implementar um mecanismo para identificar e evitar retries em erros não recuperáveis.
- [ ] Adicionar testes unitários para garantir o funcionamento correto do retry.
- [ ] Documentar a implementação do retry no hook `useLLM`.

## Notas Adicionais

O retry deve ser implementado de forma a não impactar negativamente a performance do sistema. O delay entre as tentativas deve ser configurável para evitar sobrecarga na LLM.
