# Template: Guia de Operação do Agente Autônomo LLM para Projetos

Este template destina-se a fornecer uma estrutura para a criação de um guia abrangente para agentes LLM autônomos que trabalham em um projeto de software específico. Ele deve ser preenchido com informações detalhadas relevantes para o projeto em questão.

## 1. Introdução e Boas-vindas ao Agente
*   Propósito deste documento.
*   Breve mensagem de boas-vindas ao agente.

## 2. Visão Geral do Projeto
*   **Nome do Projeto:** `[Nome do Projeto]`
*   **Descrição Concisa:** (1-2 frases sobre o que o projeto faz)
*   **Objetivos Principais do Projeto:** (Lista dos principais resultados ou metas que o projeto visa alcançar)
*   **Público-Alvo/Usuários Finais:**
*   **Links para Documentação Detalhada da Visão Geral:**
    *   Documento de Visão do Produto/Projeto: `[Link]`
    *   Requisitos Funcionais de Alto Nível: `[Link]`

## 3. Princípios Arquiteturais e de Design Mandatórios
*   **Arquitetura Principal:** (ex: Clean Architecture, Microservices, Monolito Modular)
    *   Link para o Documento de Arquitetura Detalhado: `[Link para docs/tecnico/arquitetura.md ou similar]`
*   **Principais Padrões de Design Adotados:** (ex: SOLID, DRY, KISS, Design Patterns específicos)
*   **Regras de Qualidade de Código:** (ex: Object Calisthenics, regras de linting específicas)
    *   Link para o Guia de Qualidade de Código: `[Link]`
*   **Fluxo de Dependência entre Camadas/Módulos:** (Resumo visual ou textual)

## 4. Estrutura do Código do Projeto
*   **Organização Geral dos Diretórios:** (Visão geral da estrutura de pastas na raiz e em `src/`)
*   **Localização das Camadas Arquiteturais:**
    *   Domínio: `[Path para a camada de domínio]`
    *   Aplicação: `[Path para a camada de aplicação]`
    *   Infraestrutura: `[Path para a camada de infraestrutura]`
    *   Apresentação (UI, Electron main/preload): `[Path para a camada de apresentação]`
    *   Compartilhado (Shared/Common): `[Path para código compartilhado]`
*   **Convenções de Nomenclatura Chave:** (Para arquivos, classes, variáveis, etc., se houver padrões específicos do projeto)
*   **Pontos de Entrada Principais da Aplicação:** (ex: `main.ts` para Electron, `main.tsx` para UI React)

## 5. Tecnologias, Ferramentas e Stack do Projeto
*   **Linguagem Principal e Versão:** (ex: TypeScript 5.x)
*   **Frameworks Principais (Backend/Core):** (ex: Node.js, ElectronJS)
*   **Frameworks Principais (Frontend):** (ex: React, Vite)
*   **Bibliotecas de UI Chave:** (ex: TailwindCSS, Shadcn/UI, Radix UI)
*   **Gerenciamento de Estado (Frontend):** (ex: Context API, Zustand, Redux)
*   **Roteamento (Frontend):** (ex: TanStack Router)
*   **Banco de Dados e ORM/Query Builder:** (ex: SQLite, Drizzle ORM)
*   **Testes (Frameworks e Tipos):** (ex: Vitest para unitários e integração)
*   **Linting e Formatação:** (ex: ESLint, Prettier)
*   **Build e Bundling:** (ex: Vite, Electron Forge)
*   **Sistema de Injeção de Dependência (se houver):** (ex: InversifyJS)
*   **Outras Ferramentas ou Bibliotecas Críticas:**

## 6. Fluxo de Trabalho de Desenvolvimento Mandatório
*   **Gerenciamento de Tarefas:**
    *   Localização do sistema de tarefas: `[Path para TASKS.md e pasta de tasks]`
    *   Estrutura: Índice principal (`TASKS.md`) e arquivos de detalhe (`tasks/TSK-[ID].md`).
    *   Uso do template de detalhe de tarefa: `[Path para TASK_DETAIL_TEMPLATE.md]`
    *   Processo para selecionar, desmembrar, executar e concluir tarefas (referenciar o ciclo de vida detalhado, que agora está neste `AGENTS.md`).
    *   Importância da leitura dos arquivos de detalhe e documentação contínua.
    *   Como criar novas tarefas para descobertas/impedimentos.
*   **Controle de Versão (Git):**
    *   Convenção de Nomenclatura de Branches: `[ex: feat/feature-name, fix/bug-fix, chore/task-name]`
    *   Padrão para Mensagens de Commit: `[ex: Conventional Commits: feat(scope): message]`
    *   Fluxo de Pull/Merge Requests (se aplicável quando houver interação humana).
*   **Estratégia de Testes:**
    *   Tipos de testes esperados (unit, integration, e2e).
    *   Cobertura mínima (se definida).
    *   Onde encontrar/colocar arquivos de teste.
    *   Comandos para rodar testes.
*   **Documentação:**
    *   Como documentar código (JSDoc, TSDoc, comentários).
    *   Quando e onde criar/atualizar documentação externa (ex: em `docs/`).
*   **Revisão de Código (se aplicável):**
    *   Processo de revisão, quem revisa.

## 7. Comunicação e Escalada
*   **Canal Principal para Dúvidas Técnicas:** `[ex: Solicitar input ao usuário via ferramenta]`
*   **Como Reportar Bloqueios:** `[ex: Usar request_user_input com detalhes claros]`
*   **Quando Escalar Problemas:**

## 8. Métricas de Qualidade e Performance (se aplicável)
*   Metas de cobertura de testes.
*   Limites de complexidade ciclomática.
*   Padrões de performance (ex: tempo de carregamento da UI).

## 9. Recursos Essenciais do Projeto
*   Link para o Repositório Principal: `[URL do Git]`
*   Link para Documentação Geral do Projeto: `[docs/README.md ou similar]`
*   Link para Design System/UI Kit (se houver):
*   Link para Outras Ferramentas ou Serviços Relevantes:

## 10. Protocolos de Segurança e Boas Práticas
*   Manuseio de Chaves de API e Segredos.
*   Validação de Inputs.
*   Outras considerações de segurança específicas do projeto.

## 11. Considerações Específicas do Agente LLM
*   Limitações conhecidas do agente.
*   Heurísticas de tomada de decisão preferidas.
*   Como lidar com ambiguidade nas instruções.
*   Estilo de codificação preferido (além das regras de lint).

Lembre-se de adaptar e preencher este template com as informações específicas do projeto em que você está trabalhando. O `AGENTS.md` na raiz do projeto é a instância preenchida deste guia para o "Project Wiz".
---

Este template visa ser um ponto de partida. Ele pode ser expandido ou customizado conforme necessário.
