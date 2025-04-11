# ISSUE-0148 - Remover dados fixos do dashboard e páginas

## Contexto
Atualmente, o frontend e o aplicativo mobile utilizam dados fixos (mockados ou hardcoded) em dashboards e páginas. Essa abordagem prejudica a experiência real do usuário, pode causar inconsistências e dificulta a validação do funcionamento da aplicação em cenários reais.

## Diagnóstico
O uso de dados estáticos impede a realização de testes realistas, dificulta a integração com o backend, pode vazar informações fictícias para o usuário final e mascarar erros que só ocorreriam com dados dinâmicos. Além disso, dificulta a manutenção e evolução da aplicação, pois não reflete o estado atual do sistema.

## Justificativa
Remover os dados fixos é fundamental para garantir que as informações exibidas reflitam o estado real da aplicação, melhorando a integração com o backend, aumentando a segurança e a confiabilidade do sistema. Isso também facilita a identificação de problemas reais e melhora a experiência do usuário.

## Recomendações técnicas
- Mapear todos os pontos do frontend e mobile onde há uso de dados fixos (mockados ou hardcoded)
- Substituir esses dados por chamadas a APIs reais, ou por mocks controlados via configuração (ex: ambiente de desenvolvimento)
- Implementar fallback seguro para ausência de dados, garantindo que a interface continue funcional mesmo sem resposta da API
- Documentar claramente os pontos de integração e os mocks utilizados, para facilitar manutenção e testes
- Validar a integração com o backend, garantindo que os dados dinâmicos estejam corretos e atualizados

## Critérios de aceitação
- Nenhum dado fixo (hardcoded) deve permanecer em dashboards e páginas do frontend e mobile
- Todos os dados devem ser carregados dinamicamente via API ou, em ambiente de desenvolvimento, via mocks configuráveis
- Testes automatizados devem cobrir cenários com dados disponíveis e ausência de dados (fallback)
- Código revisado e aprovado por pelo menos um membro da equipe

## Riscos e dependências
- Dependência da disponibilidade das APIs para substituição dos dados fixos
- Possível necessidade de ajustes ou criação de endpoints no backend para fornecer os dados necessários
- Impacto em testes automatizados que dependiam de dados fixos, exigindo atualização dos testes