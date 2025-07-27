# Product Requirements Document - Project Wiz

**Versão:** 2.1  
**Status:** Final  
**Data:** Janeiro 2025

Este documento é a fonte canônica para a visão, experiência do usuário e escopo funcional do Project Wiz. Ele combina os requisitos de produto, visão técnica e especificações funcionais em um único documento de referência.

---

## 1. Visão Geral e Introdução

### 1.1. Problema a Ser Resolvido

O Project Wiz visa resolver a **limitação de tempo e barreira de produtividade** enfrentadas por programadores e equipes de desenvolvimento. Com o avanço das LLMs, surge a oportunidade de automatizar e acelerar a criação de sistemas de software.

### 1.2. Solução Proposta

O Project Wiz é uma **plataforma de automação de engenharia de software** que funciona como um **time de desenvolvimento de IA autônomo**. A filosofia central é abstrair a complexidade do desenvolvimento do usuário, permitindo que ele gerencie projetos através de conversas e delegação de intenções.

### 1.3. Metáfora: O Gerente e sua Equipe de IA

A interface e experiência são projetadas em torno de uma metáfora simples: o usuário é um **Gerente de Produto ou Tech Lead**, e o Project Wiz fornece uma **equipe de especialistas de IA (Personas)** para executar o trabalho.

---

## 2. Público-Alvo

### 2.1. Público-Alvo Principal

- **Programadores com tempo limitado**
- **Pequenas e médias equipes de desenvolvimento**
- **Profissionais que buscam automatizar processos de criação de software**

### 2.2. Público-Alvo Futuro

- **Pessoas sem conhecimento de programação**
- **Qualquer indivíduo com conhecimento mínimo de tecnologia**
- **Empresas que precisam de desenvolvimento ágil**

---

## 3. Metas e Objetivos do Produto

### 3.1. Metas Primárias

As metas que definem o sucesso do Project Wiz são:

1. **Autonomia Completa na Codificação**
   - Os agentes devem resolver problemas e encontrar soluções de forma autônoma
   - Mínima intervenção humana direta no código

2. **Capacidade de Iniciar do Zero**
   - Os agentes devem levar um projeto da concepção inicial até um estado funcional
   - Criação completa de arquitetura e implementação

3. **Evolução Contínua de Projetos**
   - Capacidade de continuar evolução de projetos existentes
   - Independente de terem sido iniciados pela plataforma ou externamente

### 3.2. Métricas de Sucesso

- **Taxa de Autonomia:** Percentual de tarefas concluídas sem intervenção humana
- **Tempo de Desenvolvimento:** Redução no tempo de ideia à funcionalidade
- **Satisfação do Usuário:** Feedback direto e pesquisas
- **Projetos Concluídos:** Quantidade de projetos finalizados com sucesso
- **Utilização de Agentes:** Frequência e volume de uso por tipo de agente

---

## 4. Experiência do Usuário

### 4.1. Interface Estilo Colaborativo

- **Metáfora Discord/Slack:** Projetos como "Servidores", canais para conversas
- **Sidebar esquerda:** Mensagens Diretas (área pessoal) e Projetos
- **Área principal:** Chat, painel de atividades, configurações

### 4.2. Interação Conversacional

- **Linguagem natural:** "Precisamos implementar autenticação de dois fatores"
- **Sem formulários complexos:** Expressão direta de necessidades
- **Delegação intuitiva:** Como falar com colegas de equipe

### 4.3. Autonomia do Sistema

- **Trabalho em segundo plano:** Agentes operam autonomamente
- **Análise automática:** Sistema entende intenção e cria tarefas
- **Atribuição inteligente:** Jobs atribuídos ao especialista mais qualificado
- **Gestão completa:** Versionamento e ciclo de vida automatizados

---

## 5. Funcionalidades Conceituais

### 5.1. Módulo: Espaço Pessoal e Mensagens Diretas

**Visão:** Hub central independente de projetos para conversas privadas e configurações globais.

- **Mensagens Diretas (DMs):** Conversas 1-para-1 com Personas ou assistente geral
- **Configurações Globais:** Conta, tema, notificações, chaves de API seguras

### 5.2. Módulo: Gerenciamento de Projetos

**Visão:** Cada projeto como workspace vivo e independente com equipe e base de código próprias.

- **Ciclo de Vida:** Criar, listar, remover workspaces
- **Criação:** Do zero (novo repositório) ou importação (clone de URL)
- **Configurações:** Painel específico por projeto, controle de contratação automática

### 5.3. Módulo: Gerenciamento de Personas (Equipe de IA)

**Visão:** Configuração intuitiva de agentes como "formação de equipe" com especialistas.

- **Contratação Automática:** Sistema analisa projeto e contrata Personas relevantes
- **Contratação Manual:** Wizard assistido por IA para definir especialidade e personalidade
- **Gerenciamento:** Visualizar, editar e "demitir" Personas

### 5.4. Módulo: Fórum de Discussão do Projeto

**Visão:** Colaboração estruturada e assíncrona, base de conhecimento persistente.

- **Tópicos de Discussão:** Usuários e Personas iniciam discussões focadas
- **Colaboração:** Múltiplos especialistas colaboram em problemas complexos

### 5.5. Módulo: Interação e Fluxo de Trabalho

**Visão:** Centro de comando conversacional onde trabalho é iniciado naturalmente.

- **Iniciação Conversacional:** Linguagem natural convertida em Jobs internos
- **Painel de Atividades:** Monitoramento passivo de status (Fila, Execução, Concluído)
- **Intervenção de Exceção:** Pausar/cancelar Jobs quando necessário

---

## 6. Escopo e Funcionalidades MVP

### 6.1. Plataforma Local (Desktop)

- **Aplicação Electron** executada localmente
- **Segurança:** Dados permanecem na máquina do usuário

### 6.2. Interface de Interação

- **Comunicação via chat** (DMs ou grupos)
- **Organização por projetos** e canais dedicados
- **Interface intuitiva** para progresso e interação

### 6.3. Agentes Autônomos em Background

- **Operação em segundo plano** usando providers
- **Acesso a ferramentas** (shell, sistema de arquivos)
- **Interação com plataforma** (enviar mensagens)
- **Sistema de logs detalhado** para rastreamento

### 6.4. Contratação de Agentes Sob Demanda

- **Agentes role-based:** Frontend, Backend, QA, DevOps
- **Autogestão:** Agentes atribuem próprias tarefas
- **Objetivos de projeto:** Foco em resultados, não tarefas específicas

### 6.5. Memória dos Agentes

- **Embeddings:** Representação e armazenamento de conhecimento
- **Engenharia de contexto:** Memória curto/longo prazo
- **Aprendizado:** Melhoria com experiência

### 6.6. Orquestração de Tarefas de Longa Duração

- **Sistema orientado por LLMs** para tarefas complexas
- **Dividir para conquistar:** Quebra em subtarefas gerenciáveis
- **Feedback loop:** Auto-correção e adaptação

---

## 7. Capacidades Técnicas de Suporte

### 7.1. Sistema 1: Kernel da Aplicação

- **Orquestração de fluxo de dados:** Separação Comandos/Queries
- **Comunicação assíncrona:** Barramento de eventos desacoplado

### 7.2. Sistema 2: Camada de Persistência

- **Armazenamento local:** Banco de dados para metadados
- **Abstração de dados:** ORM para interação segura
- **Gerenciamento de schema:** Mudanças versionadas

### 7.3. Sistema 3: Comunicação com Interface

- **Ponte segura:** Backend/frontend sem vazamento de implementação
- **Contrato de interface:** Tipos compartilhados consistentes

### 7.4. Sistema 4: Sistema de Filas de Tarefas

- **Filas dedicadas:** Uma por agente ativo
- **Processamento isolado:** Trabalho em ordem pelo especialista correto

### 7.5. Sistema 5: Camada de Inteligência Artificial

- **Abstração de LLM:** Troca de provedor sem refatoração
- **Gerenciamento de prompts:** Criação, gestão e versionamento

### 7.6. Sistema 6: Interação com Ambiente

- **Ferramentas de sistema de arquivos:** Acesso seguro dentro do projeto

### 7.7. Sistema 7: Controle de Versão

- **Automação de versionamento:** Pull, commit, push autônomo
- **Provisionamento de repositório:** Novo ou clone existente
- **Gerenciamento de credenciais:** Armazenamento seguro

### 7.8. Sistema 8: Análise de Código

- **Análise de dependências:** Identificação de stack tecnológica
- **Contratação automática:** Suporte baseado em análise

### 7.9. Sistema 9: Modelo de Execução

- **Processos persistentes:** Agentes de longa duração aguardando tarefas

### 7.10. Sistema 10: Orquestrador de Intenção

- **Processamento de linguagem natural:** Análise e classificação de intenção
- **Roteamento de tarefas:** Atribuição baseada em habilidades
- **Enfileiramento:** Colocação na fila específica do agente

---

## 8. Requisitos Não-Funcionais

### 8.1. Performance

- **Responsividade:** Tempo de resposta rápido para interações
- **Execução eficiente:** Tarefas de agentes sem degradação

### 8.2. Escalabilidade

- **Múltiplos agentes:** Adição sem degradação significativa
- **Múltiplos projetos:** Gerenciamento simultâneo

### 8.3. Segurança

- **Proteção de dados:** Projetos, credenciais, interações
- **Medidas robustas:** Implementação de segurança em camadas

### 8.4. Usabilidade

- **Interface intuitiva:** Fácil para usuários com pouca experiência
- **Experiência fluida:** Navegação natural e eficiente

### 8.5. Manutenibilidade

- **Código estruturado:** Bem documentado e organizado
- **Facilidade de extensão:** Adição de novas funcionalidades

### 8.6. Confiabilidade

- **Resiliência a falhas:** Mecanismos de recuperação
- **Tratamento de erros:** Gestão robusta de exceções

---

## 9. Tecnologias

### 9.1. Stack Principal

- **Desktop:** Electron.js
- **Backend:** Node.js + TypeScript
- **Frontend:** React + Vite
- **Database:** SQLite com sqlite-vec (vetores)
- **ORM:** Drizzle
- **UI:** Tailwind CSS + Shadcn UI
- **AI:** Vercel AI SDK (multi-provider)

### 9.2. Desenvolvimento

- **Linguagem:** TypeScript (strict mode)
- **Testing:** Vitest + v8 coverage
- **Linting:** ESLint + Prettier
- **i18n:** LinguiJS

### 9.3. Infraestrutura

- **Containerização:** Sem Docker para plataforma principal
- **Isolamento:** Docker opcional para código gerado pelos agentes

---

## 10. Roadmap e Fases

### 10.1. MVP (v0.9)

- ✅ Interface Discord-like funcional
- ✅ Sistema básico de agentes
- ✅ Contratação manual de Personas
- ✅ Chat conversacional básico
- ✅ Orquestração simples de tarefas

### 10.2. v1.0

- 🔄 Contratação automática de agentes
- 🔄 Sistema de memória avançado
- 🔄 Integração com múltiplos providers
- 🔄 Análise automática de projetos

### 10.3. v1.1+

- 📋 Fórum de discussão estruturado
- 📋 Sistema avançado de feedback
- 📋 Métricas e analytics
- 📋 Integração com serviços externos

---

Este documento serve como a referência definitiva para o desenvolvimento do Project Wiz, combinando visão de produto, requisitos técnicos e especificações de implementação em uma fonte única e consistente.
