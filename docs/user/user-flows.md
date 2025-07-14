# Fluxos de Uso (user-flows.md)

Este documento detalha os principais fluxos de uso da aplicação **project-wiz**, guiando o usuário através das interações mais comuns.

## 1. Criar um Novo Projeto

Um projeto é um espaço de trabalho para organizar suas conversas, agentes e outras informações relacionadas a um tópico ou objetivo específico.

**Passo a passo:**

1.  Na barra lateral esquerda, clique no ícone **"Projetos"** (geralmente um ícone de pasta ou maleta).
2.  Na tela de Projetos, localize e clique no botão **"Novo Projeto"** (ou similar, pode ser um `+` ou um botão com texto).
3.  Uma janela ou formulário será exibido. Preencha os campos:
    - **Nome do Projeto:** Um nome descritivo para o seu projeto (ex: "Desenvolvimento do App X", "Pesquisa de Mercado").
    - **Descrição (Opcional):** Uma breve descrição do objetivo do projeto.
4.  Clique no botão **"Salvar"** ou **"Criar Projeto"**.
5.  O novo projeto será criado e você será redirecionado(a) para a tela do projeto, onde poderá começar a adicionar agentes e conversas.

## 2. Configurar um Provedor de LLM (Modelo de Linguagem Grande)

Para que o **project-wiz** possa interagir com a inteligência artificial, você precisa configurar pelo menos um provedor de LLM (ex: OpenAI, Google AI).

**Passo a passo:**

1.  Na barra lateral esquerda, clique no ícone **"Configurações"** (geralmente uma engrenagem).
2.  Dentro das configurações, procure pela seção **"Provedores de LLM"** ou **"Configurações de IA"**.
3.  Clique no botão **"Adicionar Novo Provedor"**.
4.  Selecione o **Tipo de Provedor** na lista (ex: OpenAI, Anthropic, Google Gemini).
5.  Preencha os campos necessários:
    - **Nome:** Um nome para identificar este provedor (ex: "Minha Conta OpenAI").
    - **Chave de API (API Key):** Insira sua chave de API fornecida pelo provedor. **Mantenha esta chave em segurança e nunca a compartilhe.**
    - Outras configurações específicas do provedor (ex: URL do endpoint, modelo padrão).
6.  (Opcional) Marque a opção **"Definir como Padrão"** se desejar que este seja o provedor usado por padrão para novas interações.
7.  Clique em **"Salvar"** ou **"Adicionar Provedor"**.
8.  O provedor será adicionado à sua lista. Você pode testar a conexão ou editá-lo a qualquer momento.

## 3. Criar um Agente de IA Personalizado

Agentes são configurações de IA com um propósito e personalidade definidos, que você pode usar para interações específicas.

**Passo a passo:**

1.  Na barra lateral esquerda, clique no ícone **"Agentes"**.
2.  Na tela de Agentes, clique no botão **"Novo Agente"**.
3.  Preencha os detalhes do agente:
    - **Nome:** Um nome para o seu agente (ex: "Revisor de Código", "Gerador de Ideias").
    - **Função (Role):** A função principal do agente (ex: "Especialista em Python", "Redator Criativo").
    - **Objetivo (Goal):** O que você espera que este agente faça (ex: "Revisar código Python para boas práticas", "Gerar ideias de marketing para produtos").
    - **História/Contexto (Backstory):** Uma breve descrição do "passado" ou "personalidade" do agente, que pode influenciar suas respostas.
    - **Provedor de LLM:** Selecione um dos provedores de LLM que você configurou.
    - **Temperatura:** Controla a aleatoriedade das respostas (0.0 para mais determinístico, 1.0 para mais criativo).
    - **Tokens Máximos:** Limite de tokens para a resposta do agente.
4.  Clique em **"Salvar"** ou **"Criar Agente"**.
5.  Seu novo agente estará disponível para ser usado em conversas diretas ou canais.

## 4. Iniciar uma Conversa Direta com um Agente

Converse diretamente com um agente de IA para obter ajuda em tarefas específicas.

**Passo a passo:**

1.  Na barra lateral esquerda, clique no ícone **"Mensagens Diretas"**.
2.  Clique no botão **"Nova Conversa"** ou **"Iniciar Chat"**.
3.  Uma lista de seus agentes disponíveis será exibida. Selecione o agente com quem você deseja conversar.
4.  A tela de chat será aberta. Digite sua mensagem na caixa de texto na parte inferior e pressione `Enter` ou clique no botão de envio.
5.  O agente processará sua mensagem e responderá. O histórico da conversa será mantido.

## 5. Criar um Canal de Comunicação

Canais são espaços para conversas em grupo, onde você pode interagir com múltiplos agentes ou outros usuários (se a funcionalidade for implementada).

**Passo a passo:**

1.  Na barra lateral esquerda, clique no ícone **"Canais"**.
2.  Na tela de Canais, clique no botão **"Novo Canal"**.
3.  Preencha o **Nome do Canal** (ex: "Dúvidas de Código", "Brainstorming de Features").
4.  (Opcional) Associe o canal a um projeto existente.
5.  Clique em **"Criar Canal"**.
6.  O canal será criado e você poderá começar a enviar mensagens. Você pode convidar agentes para participar do canal (se a funcionalidade estiver disponível).

## 6. Enviar Mensagens em um Canal

Interaja em um canal, seja com outros participantes ou com agentes de IA configurados para o canal.

**Passo a passo:**

1.  Na barra lateral esquerda, selecione o **Canal** desejado.
2.  Na caixa de texto na parte inferior da tela, digite sua mensagem.
3.  Pressione `Enter` ou clique no botão de envio.
4.  Sua mensagem aparecerá no histórico do chat. Se houver agentes configurados para responder no canal, eles poderão gerar uma resposta.

Estes são os fluxos de uso mais comuns. Explore a aplicação para descobrir outras funcionalidades e como elas podem otimizar seu trabalho!
