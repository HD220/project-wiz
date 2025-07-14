# Glossário (glossary.md)

Este glossário define termos técnicos e específicos do domínio utilizados no projeto **project-wiz**.

---

## Termos Técnicos

- **API (Application Programming Interface):** Conjunto de definições e protocolos usados para construir e integrar software de aplicação. No contexto do **project-wiz**, refere-se principalmente às APIs de provedores de LLM e aos canais IPC internos.

- **Backend:** A parte da aplicação que lida com a lógica de negócios, processamento de dados, comunicação com o banco de dados e serviços externos. No **project-wiz**, corresponde ao **Main Process** do Electron.

- **BrowserWindow:** Uma classe do Electron que permite criar e controlar janelas do navegador. Cada janela do **project-wiz** (ex: a janela principal) é uma `BrowserWindow`.

- **CRUD (Create, Read, Update, Delete):** As quatro operações básicas de persistência de dados. Muitos serviços e repositórios na aplicação implementam operações CRUD.

- **DTO (Data Transfer Object):** Um objeto usado para transportar dados entre diferentes camadas da aplicação (ex: entre o Renderer e o Main Process via IPC). Eles são definidos em `src/shared/types/`.

- **Drizzle ORM:** Um Object-Relational Mapper (ORM) moderno e type-safe para TypeScript, utilizado para interagir com o banco de dados SQLite.

- **Electron:** Um framework de código aberto que permite desenvolver aplicações de desktop multiplataforma usando tecnologias web (HTML, CSS, JavaScript).

- **ESLint:** Uma ferramenta de linting estático para identificar padrões problemáticos encontrados no código JavaScript/TypeScript.

- **Frontend:** A parte da aplicação com a qual o usuário interage diretamente, ou seja, a interface de usuário (UI). No **project-wiz**, corresponde ao **Renderer Process** do Electron, construído com React.

- **IPC (Inter-Process Communication):** Mecanismo que permite a comunicação entre diferentes processos. No Electron, `ipcMain` e `ipcRenderer` são usados para a comunicação segura entre o Main Process e o Renderer Process.

- **LLM (Large Language Model):** Um modelo de inteligência artificial treinado em grandes volumes de texto para entender, gerar e responder a linguagem humana (ex: GPT-4, Gemini, Claude).

- **Main Process:** O processo principal do Electron, que executa o código Node.js e gerencia o ciclo de vida da aplicação, janelas e acesso a recursos do sistema.

- **Mapper:** Uma classe ou função responsável por converter objetos de um formato para outro (ex: de uma entidade de banco de dados para um DTO, ou vice-versa).

- **ORM (Object-Relational Mapper):** Uma técnica de programação que permite mapear objetos de um programa para um sistema de banco de dados relacional, facilitando a interação com o banco de dados sem escrever SQL diretamente.

- **Preload Script:** Um script que é executado antes que o conteúdo da página web seja carregado no Renderer Process. Ele atua como uma ponte segura entre o Renderer e o Main Process, expondo APIs específicas.

- **Prettier:** Um formatador de código opinativo que garante um estilo de código consistente em todo o projeto.

- **Renderer Process:** O processo do Electron que renderiza a interface de usuário (UI) usando tecnologias web. Cada janela do navegador no Electron é um Renderer Process.

- **Repository:** Um padrão de design que abstrai a lógica de acesso a dados, fornecendo uma coleção de objetos de domínio. Ele atua como uma camada intermediária entre o domínio e a persistência de dados.

- **SQLite:** Um sistema de gerenciamento de banco de dados relacional contido em uma pequena biblioteca C. É um banco de dados leve e sem servidor, ideal para aplicações de desktop como o **project-wiz**.

- **TypeScript:** Um superconjunto tipado de JavaScript que compila para JavaScript puro. Adiciona tipagem estática, o que ajuda a identificar erros em tempo de desenvolvimento e melhora a manutenibilidade do código.

- **UUID (Universally Unique Identifier):** Um identificador de 128 bits usado para identificar informações em sistemas de computação. No **project-wiz**, é usado para IDs de entidades como projetos, agentes e mensagens.

- **Vite:** Uma ferramenta de build de frontend que oferece um ambiente de desenvolvimento extremamente rápido e otimiza o processo de build para produção.

- **Vitest:** Um framework de teste rápido para JavaScript/TypeScript, otimizado para projetos Vite.

---

## Termos de Domínio

- **Agente:** Uma configuração de IA personalizada que define como interagir com um modelo de linguagem (LLM). Inclui nome, função, objetivo, backstory, provedor de LLM associado e parâmetros como temperatura e tokens máximos.

- **Canal:** Um espaço de comunicação dentro de um projeto, onde múltiplos usuários ou agentes podem trocar mensagens. Similar a um canal de chat em plataformas como Slack ou Discord.

- **Conversa (Direct Message):** Uma interação um-a-um entre o usuário e um agente de IA específico. O histórico da conversa é mantido para contexto.

- **Mensagem:** Uma unidade de comunicação dentro de um canal ou conversa direta. Pode ser de texto, código, sistema ou arquivo.

- **Projeto:** Um contêiner organizacional dentro do **project-wiz** que agrupa agentes, canais e conversas relacionadas a um objetivo ou tópico específico. Ajuda a manter o trabalho organizado.

- **Provedor de LLM:** A configuração de acesso a um serviço de modelo de linguagem externo (ex: OpenAI, Google AI). Inclui o nome do provedor, chave de API e outras configurações de conexão.

- **Temperatura (LLM):** Um parâmetro de configuração de LLM que controla a aleatoriedade das respostas. Valores mais baixos (ex: 0.2) tornam as respostas mais determinísticas e focadas, enquanto valores mais altos (ex: 0.8) as tornam mais criativas e variadas.

- **Tokens (LLM):** A unidade básica de processamento de texto por um LLM. Pode ser uma palavra, parte de uma palavra, ou um caractere. O número de tokens afeta o custo e o tempo de processamento das requisições aos LLMs.
