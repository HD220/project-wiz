# Gerenciamento de Activity History Grande

O `activityHistory`, armazenado no `ActivityContext` dentro do campo `data` da entidade `Job`, é fundamental para o Agente Autônomo manter o contexto e raciocinar sobre a tarefa atual. No entanto, em Activities complexas ou de longa duração, o `activityHistory` pode crescer significativamente.

## Impactos do Activity History Grande

O crescimento excessivo do `activityHistory` acarreta diversos impactos negativos, conforme mencionado nas ADRs ([`docs/tasks/adrs-agents-workers-queue.md`](docs/tasks/adrs-agents-workers-queue.md)) e no design arquitetural ([`docs/tasks/architectural-design-workers-agents.md`](docs/tasks/architectural-design-workers-agents.md)):

- **Custo:** A maioria dos modelos de LLM cobra com base na quantidade de tokens processados (input + output). Um histórico longo aumenta o tamanho do prompt de entrada, elevando o custo de cada chamada ao LLM.
- **Latência:** Processar prompts maiores leva mais tempo, aumentando a latência das respostas do LLM e, consequentemente, o tempo total de execução da Activity.
- **Eficácia das Chamadas ao LLM:** Modelos de LLM possuem um limite de tokens (context window). Um `activityHistory` muito grande pode exceder esse limite, forçando a truncagem automática pelo próprio modelo (nem sempre de forma ideal) ou diluindo a relevância das informações mais recentes em meio a um histórico extenso, prejudicando a capacidade do Agente de focar e raciocinar eficientemente sobre o passo atual.

## Estratégias de Mitigação

Para lidar com o problema do `activityHistory` grande e seus impactos, as seguintes estratégias serão exploradas e implementadas:

### Sumarização Periódica

- **Como funciona:** Em pontos chave do processamento de uma Activity (ex: após a conclusão de uma sub-tarefa, antes de um passo importante), o Agente pode invocar o LLM ou usar lógica interna para gerar um resumo conciso das interações passadas. Este resumo pode ser armazenado em `activityNotes` ou em um campo dedicado. Partes mais antigas do `activityHistory` original podem então ser removidas ou movidas para um armazenamento secundário.
- **Benefícios:** Reduz drasticamente o tamanho do `activityHistory` passado para o LLM, mantendo o contexto essencial de forma sumarizada. Ajuda o Agente a manter o foco nos pontos mais importantes da Activity.

### Truncagem

- **Como funciona:** Implementar um limite máximo de tokens ou de número de entradas para o `activityHistory` que é enviado ao LLM. Ao atingir o limite, as entradas mais antigas são descartadas, priorizando as interações mais recentes.
- **Benefícios:** É uma estratégia simples de implementar e garante que o tamanho do prompt do LLM permaneça dentro de limites controláveis, otimizando custo e latência. No entanto, pode levar à perda de contexto relevante se informações importantes estiverem nas partes truncadas.

### Memória de Longo Prazo

- **Como funciona:** Utilizar um mecanismo separado (ex: um banco de dados vetorial ou um repositório dedicado) para armazenar informações cruciais de Activities concluídas ou partes antigas do `activityHistory` de Activities em andamento. O Agente pode recuperar informações relevantes dessa "memória de longo prazo" quando necessário para complementar o contexto atual.
- **Benefícios:** Permite que o Agente acesse informações de interações passadas que não estão mais no `activityHistory` imediato, fornecendo um contexto mais rico quando relevante, sem sobrecarregar o prompt do LLM com todo o histórico. É útil para lembrar de decisões anteriores, resultados de Tools ou informações importantes de Activities relacionadas.

A implementação dessas estratégias exigirá lógica adicional no `AutonomousAgent` para gerenciar o `activityHistory` de forma inteligente, equilibrando a necessidade de contexto com a otimização de custo, latência e eficácia do LLM.
