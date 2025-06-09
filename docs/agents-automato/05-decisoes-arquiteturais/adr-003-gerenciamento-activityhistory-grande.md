# ADR 003: Abordagem para Gerenciamento de activityHistory Grande

- **Título:** Estratégias para lidar com activityHistory grande.
- **Status:** Em Andamento (Requer implementação e refinamento).
- **Contexto:** O `activityHistory` dentro do `ActivityContext` pode crescer significativamente ao longo do processamento de uma Activity complexa, impactando o custo, a latência e a eficácia das chamadas ao LLM devido ao limite de tokens.
- **Decisão:** Serão exploradas e implementadas estratégias para mitigar o problema do `activityHistory` grande. As abordagens iniciais incluem:
  - **Sumarização Periódica:** O Agente pode gerar resumos do histórico de conversa em pontos chave do processo e armazená-los em `activityNotes` ou em um campo de resumo dedicado, permitindo que partes mais antigas do histórico original sejam truncadas ou movidas para memória de longo prazo.
  - **Truncagem:** Implementar limites de tamanho para o `activityHistory` passado diretamente para o LLM, priorizando as interações mais recentes.
  - **Memória de Longo Prazo:** Utilizar um mecanismo de memória de longo prazo para armazenar resumos ou informações cruciais de Activities concluídas ou partes antigas do histórico de Activities em andamento, que podem ser recuperadas quando relevante.
- **Consequências:**
  - Reduz o tamanho dos prompts do LLM, otimizando custo e latência.
  - Melhora o foco do LLM nas interações mais recentes e relevantes.
  - Requer lógica adicional no `AutonomousAgent` para gerenciar a sumarização, truncagem e interação com a memória de longo prazo.
  - A eficácia das estratégias precisará ser avaliada e ajustada durante a implementação e testes.
