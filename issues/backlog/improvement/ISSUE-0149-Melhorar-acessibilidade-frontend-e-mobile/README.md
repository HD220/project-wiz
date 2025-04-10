# ISSUE-0149 - Melhorar acessibilidade frontend e mobile

## Contexto
A aplicação apresenta deficiências de acessibilidade tanto no frontend quanto no app mobile, prejudicando usuários com necessidades especiais.

## Diagnóstico
- Falta de uso adequado de atributos e roles ARIA
- Navegação por teclado limitada ou inexistente em algumas telas
- Contraste insuficiente entre elementos e textos
- Ausência de suporte adequado a leitores de tela (NVDA, VoiceOver)
- No mobile, navegação por gestos pouco intuitiva ou ausente
- Falta de suporte às tecnologias nativas de acessibilidade

## Justificativa
Garantir a inclusão digital, conformidade com boas práticas e legislações de acessibilidade, além de melhorar a experiência para todos os usuários, independentemente de suas limitações.

## Recomendações Técnicas
- Mapear problemas de acessibilidade nas interfaces web e mobile
- Aplicar corretamente roles e atributos ARIA para elementos interativos
- Garantir navegação completa por teclado, com foco visível e ordem lógica
- Ajustar contraste e tamanhos de fonte para atender padrões WCAG
- Testar com leitores de tela populares (NVDA, VoiceOver)
- No mobile, melhorar navegação por gestos e suporte às APIs nativas de acessibilidade
- Automatizar testes de acessibilidade utilizando ferramentas como axe-core
- Documentar boas práticas de acessibilidade para o time

## Critérios de Aceitação
- Navegação por teclado funcional e acessível em todas as telas
- Contraste e tamanhos de fonte adequados e acessíveis
- Suporte a leitores de tela validado em plataformas desktop e mobile
- Mobile com navegação acessível e suporte a gestos
- Testes automatizados cobrindo os principais fluxos de acessibilidade
- Código revisado e aprovado conforme as recomendações

## Riscos e Dependências
- Impacto visual em componentes existentes devido a ajustes de contraste e foco
- Necessidade de treinamento da equipe para boas práticas de acessibilidade
- Dependência de ajustes em componentes que serão refatorados (Sidebar, hooks)