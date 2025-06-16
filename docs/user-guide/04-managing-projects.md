# Guia: Gerenciando Projetos no Project Wiz

Este guia detalha como você pode criar, configurar e gerenciar seus projetos de software dentro do Project Wiz. Um "Projeto" no Project Wiz é o contêiner principal onde seus agentes (Personas) irão trabalhar, similar a um servidor no Discord.

## 1. O Conceito de Projeto no Project Wiz

No Project Wiz, cada iniciativa de software ou repositório em que você está trabalhando é encapsulada como um **Projeto**. Dentro de um projeto, você pode:

*   Definir o escopo e os objetivos.
*   Atribuir Personas (agentes de IA) para realizar tarefas.
*   Gerenciar Jobs (tarefas) específicos para aquele contexto.
*   Manter documentação e discussões (Fórum).
*   Acompanhar o progresso e analytics específicos.

## 2. Criando um Novo Projeto

A funcionalidade de criação de projetos permite iniciar um novo espaço de trabalho. Você geralmente encontrará a opção para adicionar um novo projeto na área "Home" da aplicação.

Conforme planejado (e descrito no [Roadmap de Desenvolvimento](../project-overview/roadmap.md) e na Visão Geral da Interface):

*   **Projeto em Branco:** Você poderá iniciar um projeto do zero, definindo seu nome e descrição diretamente no Project Wiz. Este tipo de projeto é ideal para quando você está começando uma nova ideia ou se o código-fonte não reside em uma plataforma versionada externamente (ou ainda não).
*   **A Partir de um Repositório GitHub:** O Project Wiz planeja permitir a criação de projetos vinculados diretamente a repositórios GitHub existentes.
    *   Isso facilitaria a integração com seu código-fonte, issues, e outras informações do GitHub.
    *   As Personas poderiam, por exemplo, clonar o repositório, analisar o código, e interagir com as issues e pull requests do GitHub (funcionalidades futuras).

*(Detalhes exatos da interface de criação de projetos serão adicionados conforme a funcionalidade é implementada e a UI finalizada).*

## 3. Configurando seu Projeto

Após a criação, um projeto pode necessitar de configurações adicionais, geralmente acessíveis através da "Visão por Projeto" -> "Configurações do Projeto":

*   **Nome e Descrição:** Editar as informações básicas do projeto.
*   **Repositórios Associados:** Vincular ou atualizar links para repositórios de código (ex: GitHub, GitLab).
*   **Membros e Personas:**
    *   Convidar usuários humanos para colaborar no projeto (se aplicável).
    *   Atribuir ou desatribuir Personas (agentes de IA) para trabalhar especificamente neste projeto.
*   **Configurações de Integração Específicas do Projeto:** Definir como o projeto interage com ferramentas externas (diferente das integrações globais).

## 4. Navegando pela "Visão por Projeto"

Uma vez que um projeto é selecionado, a interface do Project Wiz se adapta para mostrar informações e ferramentas contextuais. Consulte o [Visão Geral da Interface](./03-interface-overview.md#visao-por-projeto-acessivel-geralmente-pela-rota-projectprojectid) para um detalhamento das seções disponíveis, como:

*   Dashboard do Projeto
*   Tarefas do Projeto
*   Fórum do Projeto
*   Documentação do Projeto
*   Analytics do Projeto
*   Canais do Projeto

## 5. Arquivando ou Deletando Projetos (Funcionalidade Futura)

Funcionalidades para arquivar projetos (removê-los da lista ativa, mas manter os dados) ou deletá-los permanentemente serão consideradas no desenvolvimento futuro.

## Próximos Passos

*   Aprenda como popular seu projeto com Agentes de IA em: [Configurando Personas e Agentes](./05-personas-agents.md).
*   Entenda como definir e delegar trabalho em: [Automatizando Tarefas com Jobs](./06-jobs-automation.md).

Este guia será atualizado à medida que as funcionalidades de gerenciamento de projetos forem evoluindo.
