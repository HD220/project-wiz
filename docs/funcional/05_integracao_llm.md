# Integração com Modelos de Linguagem Grandes (LLM)

A integração com Modelos de Linguagem Grandes (LLMs) é um pilar central do Project Wiz, capacitando a inteligência e autonomia dos Agentes IA.

## Funcionalidades Principais:

1.  **Configuração de Provedores de LLM:**
    *   O sistema permite que usuários configurem diferentes provedores de LLM (ex: OpenAI, DeepSeek, Anthropic).
    *   A configuração inclui detalhes como chaves de API (gerenciadas de forma segura), endpoints e outros parâmetros específicos do provedor.
    *   A UI (`llm-config-form.tsx`) suporta este processo de configuração.

2.  **Seleção de Modelo por Persona:**
    *   Ao definir uma Persona, o usuário pode associar um modelo de LLM específico (dentre os configurados) a ela.
    *   Isso permite que diferentes Personas utilizem diferentes LLMs ou variações de modelos (ex: GPT-4 para uma Persona Sênior, GPT-3.5-turbo para uma Persona Júnior, ou um modelo especializado em código).

3.  **LLM como Motor de Raciocínio e Planejamento para Agentes:**
    *   Os Agentes IA utilizam o LLM configurado por sua Persona para:
        *   **Interpretar Solicitações:** Entender as necessidades e objetivos expressos pelo usuário nas conversas.
        *   **Planejar Ações:** Decompor tarefas complexas em Jobs e Sub-Jobs sequenciais ou paralelos.
        *   **Tomar Decisões:** Escolher a próxima ação ou `Tool` a ser utilizada com base no contexto atual e no objetivo do Job.
        *   **Gerar Conteúdo:** Criar texto, código, documentação, scripts de teste, etc.
        *   **Analisar Informações:** Processar e extrair insights de dados, código ou logs.
        *   **Auto-Validação:** Avaliar os resultados de suas próprias ações contra critérios de "Definição de Pronto".

4.  **Interação Contextualizada:**
    *   As interações com o LLM são altamente contextualizadas para melhorar a relevância e precisão das respostas. O contexto fornecido ao LLM inclui:
        *   **Prompt de Sistema da Persona:** Define o papel, objetivo, backstory e estilo de atuação do Agente.
        *   **`ActivityContext` do Job Atual:** Contém o histórico da conversa/interações anteriores dentro do mesmo Job, dados de entrada, resultados parciais de `Tools`, e notas do Agente.
        *   **`AgentInternalState` (Parcialmente):** Informações relevantes da memória de longo prazo do Agente podem ser injetadas no prompt para fornecer um contexto mais amplo ou conhecimentos específicos do projeto.
        *   **Descrição das `Tools` Disponíveis:** O LLM recebe informações sobre as `Tools` que o Agente pode utilizar, incluindo seus nomes, descrições de funcionalidade, parâmetros de entrada esperados e formato de saída.

5.  **Orquestração de `Tools` pelo LLM:**
    *   O LLM pode decidir solicitar a execução de uma ou mais `Tools` disponíveis para cumprir um objetivo.
    *   O sistema (Agente e `ToolRegistry`) interpreta a intenção do LLM, executa a `Tool` solicitada com os argumentos fornecidos pelo LLM, e retorna o resultado da `Tool` de volta ao LLM para processamento subsequente.

6.  **Abstração da Comunicação (AI SDK):**
    *   Um "Ponto de Integração LLM" ou um AI SDK (como Vercel AI SDK) abstrai as particularidades das APIs dos diferentes provedores de LLM.
    *   Isso simplifica a lógica do Agente, que interage com uma interface unificada para enviar prompts e receber respostas.
    *   Pode gerenciar aspectos como formatação de histórico de mensagens e tratamento de erros comuns da API.

7.  **Segurança:**
    *   O gerenciamento de chaves de API e outras informações sensíveis de configuração de LLM deve ser feito de forma segura.

A flexibilidade na escolha e configuração de LLMs, combinada com a capacidade dos Agentes de interagir contextualmente e orquestrar `Tools` através deles, é o que permite ao Project Wiz realizar uma vasta gama de tarefas de desenvolvimento de forma inteligente.
