## Progresso da Refatoração

- [x] Refatoração aplicada em `src/client/components/empty-viewer.tsx`.
  - Adicionados os atributos `role="img"` e `aria-label="Empty file icon"` ao elemento `<svg>`, conforme detalhado na issue e no relatório de análise.
- O componente agora está em conformidade com as recomendações de acessibilidade (ARIA) e Clean Code.
- Não houve impacto em outras partes do código.

### Decisões
- Seguido o padrão de código em inglês (SDR-0001).
- Mantida a simplicidade e legibilidade do componente.
- Não foi necessário alterar a estrutura do componente nem criar funções auxiliares.

### Próximos passos
- Validar a acessibilidade em ambiente de execução.
- Encerrar a issue após validação.