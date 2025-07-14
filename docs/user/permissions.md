# Permissões e Controle de Acesso (permissions.md)

Este documento esclarece como as "permissões" e o "controle de acesso" funcionam dentro do **project-wiz**, considerando que é uma aplicação de desktop para um único usuário.

## 1. Modelo de Permissões no project-wiz

O **project-wiz** é uma aplicação de desktop projetada para uso individual. Isso significa que, por padrão, **o usuário que instalou e executa a aplicação tem controle total sobre todas as suas funcionalidades e dados.** Não há um sistema de múltiplos usuários, papéis (como "Administrador", "Editor", "Visualizador") ou controle de acesso baseado em rede como em aplicações web ou empresariais.

As "permissões" no contexto do **project-wiz** referem-se principalmente à capacidade do usuário de:

- **Gerenciar Projetos:** Criar, editar, arquivar e excluir projetos.
- **Configurar Provedores de LLM:** Adicionar, modificar e remover provedores de modelos de linguagem, incluindo suas chaves de API.
- **Criar e Gerenciar Agentes:** Definir, personalizar e interagir com agentes de IA.
- **Acessar Dados Locais:** Todos os dados (projetos, agentes, conversas, mensagens) são armazenados localmente no seu computador e são acessíveis apenas pelo usuário da aplicação.

## 2. Onde e Como as "Permissões" são Gerenciadas

Como não há um sistema de papéis, o controle é inerente ao acesso físico e lógico à sua máquina e à aplicação:

- **Acesso ao Sistema Operacional:** Quem tem acesso ao seu computador e à sua conta de usuário pode executar o **project-wiz** e, consequentemente, acessar e modificar todos os dados da aplicação.
- **Configurações da Aplicação:** Todas as configurações, incluindo a adição de provedores de LLM e a criação de agentes, são gerenciadas diretamente através da interface do usuário do **project-wiz**.
  - **Provedores de LLM:** A seção de configurações de provedores de LLM permite que você adicione e gerencie suas chaves de API. O acesso a essas chaves é restrito à aplicação e ao usuário.
  - **Agentes:** A criação e modificação de agentes são feitas na seção de gerenciamento de agentes. Qualquer agente criado é de propriedade do usuário da aplicação.

## 3. Considerações de Segurança

Embora o **project-wiz** seja uma aplicação local, algumas considerações de segurança são importantes:

- **Chaves de API:** Suas chaves de API para provedores de LLM são credenciais sensíveis. Embora armazenadas localmente, é crucial que você as mantenha seguras e não as compartilhe. Se seu computador for comprometido, suas chaves podem ser expostas.
- **Acesso Físico:** Proteja seu computador com senhas fortes e outras medidas de segurança para evitar acesso não autorizado à aplicação e aos seus dados.
- **Atualizações:** Mantenha o **project-wiz** sempre atualizado para garantir que você tenha as últimas correções de segurança e melhorias.

Em resumo, o controle de acesso no **project-wiz** é direto: o usuário da aplicação tem controle total sobre seus dados e configurações. A segurança dos dados depende primariamente da segurança do seu sistema operacional e das suas práticas de gerenciamento de chaves de API.
