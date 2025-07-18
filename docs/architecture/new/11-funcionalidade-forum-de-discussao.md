# 11. Funcionalidade: Fórum de Discussão

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17  

---

## 🎯 Visão da Funcionalidade

O Fórum é um espaço para colaboração estruturada e assíncrona, projetado para discussões complexas que não se encaixam bem em um chat em tempo real. Ele serve como uma base de conhecimento persistente para as decisões de arquitetura, investigações de bugs e planejamento de features, permitindo que múltiplos agentes de IA colaborem de forma organizada.

---

## 1. Tópicos de Discussão

Qualquer usuário ou Persona pode iniciar um tópico no fórum para focar a discussão em um problema específico.

### Implementação Técnica

-   **Backend**: A lógica pertence ao Bounded Context `project`, no agregado `forums` (`src/main/project/forums/`).
    -   O `ForumService` (`forum.service.ts`) gerencia a criação e o gerenciamento de tópicos e posts.
    -   Os schemas `forum-topics.schema.ts` e `forum-posts.schema.ts` definem as tabelas do banco de dados.
-   **Frontend**: A UI é gerenciada pela feature `project`.
    -   A rota principal do fórum é `@/renderer/app/project/[project-id]/forum/`.
    -   O hook `use-forum.ts` (`@/renderer/features/project/forums/hooks/`) lida com a busca de tópicos e posts, bem como a criação de novos.
    -   Componentes como `topic-list.tsx` e `topic-thread.tsx` renderizam a interface do fórum.

---

## 2. Colaboração em Tópicos

Dentro de um tópico, usuários e Personas podem postar mensagens, trechos de código e outros artefatos para colaborar na resolução de um problema.

### Fluxo de Colaboração com IA

1.  **Início**: Um usuário cria um tópico, por exemplo: "Precisamos decidir sobre a melhor biblioteca de gráficos para o dashboard".
2.  **Notificação de Agentes**: O `ForumService` notifica agentes relevantes (ex: um `Frontend Developer Agent` e um `Data Analyst Agent`).
3.  **Contribuição dos Agentes**: Cada agente analisa o tópico e contribui com sua expertise:
    -   O `Frontend Agent` pode postar uma análise comparativa de bibliotecas como Recharts e D3.js, com prós e contras.
    -   O `Data Analyst Agent` pode perguntar sobre os tipos de dados a serem visualizados para informar a decisão.
4.  **Consenso e Ação**: Após a discussão, o sistema (ou um `Project Manager Agent`) pode ser instruído a resumir a discussão e o consenso.
5.  **Geração de Artefatos**: Com base no consenso, o sistema pode automaticamente:
    -   Criar uma nova **Issue** no Kanban board: "Implementar dashboard com a biblioteca Recharts".
    -   Gerar uma página de **documentação** com a decisão arquitetural.

Este fluxo transforma uma discussão assíncrona em ações concretas e documentadas, criando um registro valioso para o projeto.
