# Handoff - ISSUE-0148 - Remover dados fixos do dashboard e páginas

## Resumo do problema
O frontend e o aplicativo mobile utilizam dados fixos (mockados ou hardcoded) em dashboards e páginas, o que prejudica a experiência real do usuário, dificulta a integração com o backend e pode mascarar erros reais.

## Passos sugeridos para execução
1. **Mapeamento:** Identificar todos os locais no código onde dados fixos são utilizados, tanto no frontend quanto no mobile.
2. **Planejamento:** Definir para cada ponto se será substituído por chamada real à API ou por mock configurável.
3. **Substituição:** Implementar a substituição dos dados fixos por chamadas dinâmicas.
4. **Fallback:** Garantir que, na ausência de dados da API, a interface tenha um fallback seguro e informativo.
5. **Documentação:** Atualizar a documentação técnica indicando os pontos de integração e os mocks utilizados.
6. **Testes:** Atualizar ou criar testes automatizados cobrindo cenários com dados reais, ausência de dados e fallback.
7. **Revisão:** Submeter o código para revisão, garantindo que os critérios de aceitação foram atendidos.

## Pontos de atenção para integração e testes
- Verificar a disponibilidade e estabilidade das APIs que fornecerão os dados dinâmicos.
- Coordenar com o backend para criação ou ajuste de endpoints, se necessário.
- Atualizar testes automatizados que dependiam de dados fixos para utilizar mocks configuráveis ou dados dinâmicos.
- Garantir que o fallback não exponha dados fictícios ou cause erros na interface.
- Validar a experiência do usuário em diferentes cenários (com dados, sem dados, erro na API).

## Checklist para revisão
- [ ] Todos os dados fixos removidos de dashboards e páginas
- [ ] Dados dinâmicos carregados via API ou mocks configuráveis
- [ ] Fallback seguro implementado para ausência de dados
- [ ] Testes automatizados atualizados e cobrindo os cenários principais
- [ ] Documentação técnica atualizada
- [ ] Código revisado e aprovado

## Links cruzados
- Futuras issues podem ser abertas para ajustes ou criação de endpoints no backend, caso identificadas dependências durante a execução desta tarefa.