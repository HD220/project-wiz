# FAQ e Solução de Problemas (faq.md)

Este documento aborda perguntas frequentes e oferece soluções para problemas comuns que você pode encontrar ao usar o **project-wiz**.

## Perguntas Frequentes (FAQ)

### 1. O que é um "Provedor de LLM"?

Um Provedor de LLM (Large Language Model) é um serviço que oferece acesso a modelos de linguagem de inteligência artificial, como OpenAI (ChatGPT), Anthropic (Claude), Google AI (Gemini), etc. O **project-wiz** permite que você configure suas credenciais para se conectar a esses serviços e usar seus modelos diretamente na aplicação.

### 2. Preciso de uma conta em um provedor de LLM para usar o project-wiz?

Sim, para aproveitar todas as funcionalidades de IA do **project-wiz**, você precisará de uma conta e uma chave de API válida de pelo menos um provedor de LLM (ex: OpenAI, Google AI Studio). Alguns recursos básicos podem funcionar sem isso, mas a interação com a IA será limitada.

### 3. Onde minhas chaves de API são armazenadas?

Suas chaves de API são armazenadas localmente no seu computador, no banco de dados da aplicação. Elas não são enviadas para nenhum servidor externo do **project-wiz**. Recomendamos sempre seguir as melhores práticas de segurança para suas chaves de API.

### 4. O que é um "Agente"?

Um Agente no **project-wiz** é uma configuração personalizada de um modelo de IA. Você pode definir seu nome, função, objetivo e até uma "personalidade" (backstory) para que ele responda de uma maneira específica. Isso permite que você tenha diferentes "especialistas" de IA para diferentes tarefas (ex: um agente para revisão de código, outro para brainstorming).

### 5. Qual a diferença entre "Canais" e "Mensagens Diretas"?

- **Canais:** São espaços de comunicação projetados para interações em grupo. Todos participantes do projeto tem acesso e podem iteragir nos canais do projeto.
- **Mensagens Diretas:** São conversas um-a-um (ou grupo), geralmente entre você e um agente de IA específico. É ideal para tarefas individuais ou quando você precisa de uma interação mais focada e que não esta necessariamente relacionada a um projeto.

### 6. Posso usar o project-wiz offline?

Você pode usar o **project-wiz** offline para gerenciar seus projetos, agentes e conversas existentes. No entanto, para interagir com os modelos de linguagem (LLMs) e gerar respostas de IA, é necessária uma conexão ativa com a internet, pois os modelos são acessados via API remota.

## Solução de Problemas

### 1. Erro: "Falha ao conectar ao provedor de LLM" ou "Chave de API inválida"

- **Verifique sua Chave de API:** Certifique-se de que a chave de API que você inseriu está correta e ativa no site do seu provedor de LLM (ex: OpenAI, Google AI). Copie e cole novamente para evitar erros de digitação.
- **Status do Provedor:** Verifique se o serviço do provedor de LLM está online. Às vezes, provedores podem ter interrupções temporárias.
- **Limites de Uso:** Confirme se você não atingiu os limites de uso ou cotas da sua conta no provedor de LLM.
- **Conexão com a Internet:** Verifique sua conexão com a internet.

### 2. O Agente não está respondendo ou a resposta está incompleta

- **Provedor de LLM Configurado:** Certifique-se de que o agente está associado a um provedor de LLM válido e ativo nas configurações do agente.
- **Tokens Máximos:** Verifique se o limite de "Tokens Máximos" configurado para o agente ou na solicitação não é muito baixo para a complexidade da resposta esperada. Um valor baixo pode truncar a resposta.
- **Contexto da Conversa:** Para respostas mais relevantes, forneça contexto suficiente. Em conversas longas, o histórico pode ser limitado pelo provedor de LLM.
- **Problemas de Conexão:** Verifique sua conexão com a internet.

### 3. A aplicação está lenta ou travando

- **Reinicie a Aplicação:** Feche e reabra o **project-wiz**.
- **Recursos do Sistema:** Verifique o uso de CPU e memória do seu computador. Aplicações Electron e interações com LLMs podem consumir recursos.
- **Atualize a Aplicação:** Certifique-se de que você está usando a versão mais recente do **project-wiz**. Atualizações frequentemente incluem otimizações de desempenho.
- **Limpar Cache/Dados (Avançado):** Em casos extremos, pode ser necessário limpar o cache ou os dados locais da aplicação. Consulte a documentação de suporte para instruções específicas, pois isso pode resetar suas configurações.

### 4. Não consigo criar um novo Projeto/Agente/Provedor

- **Mensagens de Erro:** Preste atenção a quaisquer mensagens de erro exibidas na tela. Elas geralmente indicam o que deu errado (ex: nome já existe, campos obrigatórios não preenchidos).
- **Permissões:** Embora o **project-wiz** seja uma aplicação de desktop local, certifique-se de que não há restrições de permissão no seu sistema operacional que impeçam a aplicação de gravar dados.

### 5. Onde posso obter mais ajuda?

- **Documentação:** Consulte os outros documentos técnicos e de usuário para informações mais detalhadas.
- **Comunidade/Suporte:** Verifique o site oficial do **project-wiz** ou o repositório do GitHub para fóruns de suporte, comunidades ou canais de contato.
