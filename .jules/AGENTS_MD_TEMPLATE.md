# Template para Arquivo `AGENTS.md` (Guia do Agente LLM para o Repositório)

Este template fornece uma estrutura sugerida para criar um arquivo `AGENTS.md` eficaz, destinado a orientar agentes LLM autônomos que trabalham em um repositório de software específico. Preencha e adapte as seções conforme a necessidade do projeto.

---

# Guia para Agentes LLM Trabalhando no Repositório [Nome do Projeto]

Bem-vindo, Agente LLM! Este documento é seu guia específico para entender e contribuir com o codebase do projeto **[Nome do Projeto]**. Nosso objetivo é [Principal objetivo do projeto em relação ao agente], e sua colaboração inteligente é fundamental.

## 1. Visão Geral do Projeto Específico
*   **Propósito do Projeto:** [Descreva em 1-3 frases o que este projeto faz e qual seu principal valor.]
*   **Papel do Agente neste Projeto:** [Descreva o que se espera que o agente LLM faça neste repositório específico.]
*   **Links Críticos Iniciais:**
    *   Documentação Geral do Projeto (se houver, além deste AGENTS.md): `[Link]`
    *   Repositório Principal (se este AGENTS.md estiver em um sub-repositório): `[Link]`
    *   Sistema de Gerenciamento de Tarefas (ex: `/.jules/TASKS.md`): `[Link]`

## 2. Princípios Arquiteturais e de Design (Específicos do Projeto)
*   **Arquitetura Adotada:** [ex: Clean Architecture, Microserviços, etc. Detalhar brevemente ou linkar para o documento de arquitetura principal, ex: `docs/tecnico/arquitetura.md`].
*   **Principais Padrões de Design a Serem Observados:** [Listar padrões específicos importantes para este projeto].
*   **Regras de Qualidade de Código Mandatórias:** [ex: Object Calisthenics, regras de linting específicas do projeto. Linkar para guias de estilo, se houver].
*   **Fluxo de Dependência Chave:** [Breve descrição ou diagrama simplificado do fluxo de dependências entre as principais camadas/módulos do projeto].

## 3. Estrutura do Código do Projeto (Destaques)
*   **Principais Diretórios e Seu Propósito:**
    *   `src/`: [Descrição do conteúdo principal de `src/`]
    *   `src/core/domain/`: [Propósito e exemplos]
    *   `src/core/application/`: [Propósito e exemplos]
    *   `src/infrastructure/`: [Propósito e exemplos]
    *   `src/presentation/`: [Propósito e exemplos]
    *   `tests/`: [Onde encontrar e colocar testes]
    *   `docs/`: [Onde encontrar documentação adicional]
    *   `[Outro Diretório Importante]/`: [Propósito]
*   **Convenções de Nomenclatura Específicas do Projeto:** [Se houver]
*   **Pontos de Entrada da Aplicação:** [ex: `main.ts`, `index.html`, etc.]

## 4. Stack Tecnológico e Ferramentas Chave (com Particularidades do Projeto)
*   **Linguagem Principal:** `[Linguagem e Versão]`
*   **Framework(s) Principal(is):** `[Nome e Versão]`
    *   *Notas específicas do projeto:* [Como o framework é usado, padrões comuns no projeto]
*   **Bibliotecas Críticas:**
    *   `[Nome da Biblioteca]`: [Propósito e como/onde é usada no projeto]
    *   `[Outra Biblioteca]`: [Propósito e como/onde é usada no projeto]
*   **Ferramentas de Build/Linting/Teste e Comandos:**
    *   Build: `[Comando]`
    *   Lint: `[Comando]`
    *   Testes: `[Comando para todos, comando para unitários, etc.]`

## 5. Fluxo de Trabalho de Desenvolvimento Específico do Projeto
*   **Gerenciamento de Tarefas:**
    *   Referência ao sistema de tarefas: `[Ex: /.jules/TASKS.md e /.jules/tasks/]`
    *   **LEITURA OBRIGATÓRIA DOS DETALHES DA TAREFA:** Antes de iniciar qualquer tarefa, leia integralmente seu arquivo de detalhe em `/.jules/tasks/TSK-[ID].md`.
    *   **DOCUMENTAÇÃO CONTÍNUA:** Durante a execução de uma tarefa, adicione notas e comentários relevantes diretamente no arquivo de detalhe da tarefa.
    *   **CRIAÇÃO DE NOVAS TAREFAS:** Se descobrir trabalho não planejado ou bloqueios, PARE, crie uma nova tarefa (no índice `TASKS.md` e seu arquivo de detalhe), comunique e reavalie.
    *   Atualização de status e links de commit conforme o ciclo de trabalho detalhado.
*   **Controle de Versão (Git):**
    *   Convenção de Nomenclatura de Branches: `[Padrão do Projeto, ex: feat/ID-descricao]`
    *   Padrão para Mensagens de Commit: `[Padrão do Projeto, ex: Conventional Commits]`
    *   Processo de PR/MR (se aplicável):
*   **Estratégia de Testes do Projeto:**
    *   Onde encontrar exemplos de testes.
    *   Foco em testes unitários para lógica de domínio/aplicação.
    *   Testes de integração para interações com infraestrutura.
*   **Diretrizes de Documentação do Projeto:**
    *   Onde a documentação de código (TSDoc/JSDoc) é mais crítica.
    *   Quando criar/atualizar documentos na pasta `docs/`.

## 6. Pontos de Atenção Específicos do Repositório
*   **Código Legado:** [Se houver, onde está e como interagir (ou não interagir) com ele].
*   **Áreas Sensíveis/Complexas do Código:** [Módulos que requerem cuidado extra].
*   **Integrações Chave:** [Sistemas externos ou módulos internos com acoplamento forte].
*   **Configurações de Ambiente:** [Como lidar com variáveis de ambiente, arquivos `.env`].

## 7. Como Pedir Ajuda ou Esclarecimentos
*   **Canal Preferencial:** [ex: Usar `request_user_input` com o ID da tarefa e uma pergunta clara].
*   **Informações a Fornecer ao Pedir Ajuda:** [ex: ID da tarefa, descrição do problema, o que já foi tentado].

## 8. Checklist de "Pronto para Commitar/Submeter" (Específico do Projeto)
- [ ] Código adere aos princípios arquiteturais e de design?
- [ ] Object Calisthenics foi aplicado?
- [ ] Testes unitários/integração foram escritos/atualizados para as mudanças?
- [ ] `npm run lint` passa sem novos erros?
- [ ] `npm run type-check` (ou similar) passa sem erros?
- [ ] Documentação de código (TSDoc/JSDoc) foi adicionada/atualizada?
- [ ] Documentação externa (`docs/`) foi atualizada, se necessário?
- [ ] A mensagem de commit segue o padrão do projeto?
- [ ] O arquivo de detalhe da tarefa em `/.jules/tasks/` foi atualizado (status, notas, etc.)?
- [ ] O arquivo de índice `/.jules/TASKS.md` foi atualizado?

## 9. (Opcional) Comandos Úteis Específicos do Projeto
*   `[comando1]`: [descrição]
*   `[comando2]`: [descrição]

---
Este `AGENTS.md` é um documento vivo. Consulte-o frequentemente e contribua para sua melhoria se identificar áreas que podem ser mais claras ou mais úteis para agentes LLM.
