# Project Wiz

**Sua Fábrica Autônoma de Software**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/HD220/project-wiz)](https://github.com/HD220/project-wiz/issues)
[![GitHub forks](https://img.shields.io/github/forks/HD220/project-wiz)](https://github.com/HD220/project-wiz/network)
[![GitHub stars](https://img.shields.io/github/stars/HD220/project-wiz)](https://github.com/HD220/project-wiz/stargazers)

## 🚀 O que é o Project Wiz?

O Project Wiz é uma plataforma de automação de engenharia de software que funciona como um **time de desenvolvimento de IA autônomo**. Imagine ter uma equipe completa de especialistas em IA trabalhando para você, onde você atua como Gerente de Produto ou Tech Lead, delegando tarefas através de conversas naturais.

## 🎯 A Metáfora Central

### Você é o Gerente, Agentes são sua Equipe

A filosofia do Project Wiz é simples: **abstrair a complexidade do desenvolvimento de software**, permitindo que você gerencie projetos através de conversas e delegação de intenções, não comandos diretos.

- **🗣️ Interação Natural**: "Pessoal, precisamos implementar autenticação de dois fatores"
- **🤖 Execução Autônoma**: O sistema analisa, planeja e executa automaticamente
- **📊 Supervisão Inteligente**: Você monitora o progresso sem microgerenciamento

### Interface Familiar

A interface se assemelha ao Discord/Slack que você já conhece:

- **Projetos** na barra lateral (como "Servidores")
- **Mensagens Diretas** para conversas pessoais
- **Canais** para discussões de projeto
- **Fórum** para colaboração estruturada

## ✨ Funcionalidades Principais

### 🏠 Espaço Pessoal

- **Mensagens Diretas**: Conversas 1-para-1 com qualquer agente
- **Configurações Globais**: Gerenciamento de conta, temas, notificações e chaves de API seguras

### 📁 Gerenciamento de Projetos

- **Workspaces Vivos**: Cada projeto é um ambiente independente com sua própria equipe
- **Integração Git**: Crie novos projetos ou importe repositórios existentes
- **Configurações Personalizadas**: Controle a "contratação automática" de Agentes

### 🤖 Equipe de IA

- **Contratação Automática**: O sistema analisa seu projeto e contrata especialistas relevantes
- **Criação Manual**: Wizard assistido por IA para criar Agentes especializadas
- **Gerenciamento de Equipe**: Visualize, edite e "demita" Agentes conforme necessário

### 💬 Fórum de Discussão

- **Tópicos Estruturados**: Colaboração organizada para problemas complexos
- **Base de Conhecimento**: Decisões e investigações ficam documentadas
- **Colaboração Multi-Agente**: Múltiplos especialistas trabalham juntos

### ⚡ Fluxo de Trabalho Inteligente

- **Iniciação Conversacional**: Expresse necessidades em linguagem natural
- **Painel de Atividades**: Monitore status de Jobs sem microgerenciamento
- **Intervenção de Exceção**: Pause ou cancele trabalhos quando necessário

## 🔧 Stack Tecnológica

- **Framework**: ElectronJS (aplicação desktop multiplataforma)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + TypeScript
- **IA**: Large Language Models (OpenAI, DeepSeek)
- **Banco de Dados**: SQLite com Drizzle ORM
- **Build**: Vite
- **Testes**: Vitest
- **Qualidade**: ESLint + Prettier

## 🎯 Para Quem é Destinado?

### Desenvolvedores e Equipes

- Automatize tarefas repetitivas
- Acelere o desenvolvimento
- Foque em inovação e problemas complexos

### Gerentes de Projeto

- Orquestre tarefas complexas facilmente
- Acompanhe progresso em tempo real
- Delegue através de conversas naturais

### Empresas de Software

- Aumente produtividade da equipe
- Otimize fluxos de trabalho
- Reduza tempo de desenvolvimento

### Entusiastas de IA

- Explore o potencial da IA no desenvolvimento
- Experimente colaboração humano-IA
- Teste automação inteligente

## 🚀 Iniciando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Chaves de API para LLMs (OpenAI, DeepSeek)

### Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/HD220/project-wiz.git
   cd project-wiz
   ```

2. **Instale dependências**

   ```bash
   npm install
   ```

3. **Configure variáveis de ambiente**

   ```bash
   cp .env.example .env
   # Edite .env com suas chaves de API
   ```

4. **Configure o banco de dados**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Execute a aplicação**
   ```bash
   npm run dev
   ```

## 💡 Fluxo de Trabalho Típico

### 1. Criação do Projeto

```
Usuário → Cria novo projeto ou importa repositório Git
```

### 2. Formação da Equipe

```
Sistema → Analisa código e contrata Agentes automaticamente
Usuário → Pode criar Agentes adicionais manualmente
```

### 3. Delegação de Tarefas

```
Usuário → "Precisamos implementar autenticação OAuth"
Sistema → Analisa intenção → Cria Jobs → Atribui ao especialista
```

### 4. Execução Autônoma

```
Agente → Executa tarefa → Gera código → Commita alterações
Sistema → Notifica usuário sobre progresso
```

### 5. Colaboração Estruturada

```
Usuário → Cria tópico no fórum para discussão complexa
Múltiplas Agentes → Colaboram na solução
```

## 🏗️ Arquitetura Simplificada

### Domínios Principais

- **Projects**: Container de colaboração (projetos, canais, mensagens)
- **Agents**: Workers autônomos (agentes, filas, processamento)
- **Users**: Espaço pessoal (mensagens diretas, configurações)
- **LLM**: Infraestrutura compartilhada (provedores, geração de texto)

### Padrões Aplicados

- **Object Calisthenics**: Código limpo e manutenível
- **Domain-Driven Design**: Modelagem focada no negócio
- **Event-Driven Architecture**: Comunicação desacoplada
- **Clean Architecture**: Separação de responsabilidades

## 🤝 Contribuindo

Contribuições são bem-vindas! Consulte nosso [Guia de Contribuição](./docs/developer/contributing.md) para detalhes sobre:

- Como configurar o ambiente de desenvolvimento
- Padrões de código e boas práticas
- Processo de submissão de Pull Requests
- Testes e documentação

## 📚 Documentação

- **[Guia do Usuário](./docs/user/)**: Como usar o Project Wiz
- **[Guia do Desenvolvedor](./docs/developer/)**: Arquitetura e desenvolvimento
- **[Guia de Início Rápido](./docs/developer/DEVELOPER_QUICKSTART.md)**: Configuração rápida

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para detalhes.

## 🚀 Roadmap

- [ ] **v0.9**: Funcionalidades básicas de projeto e agentes
- [ ] **v1.0**: Sistema completo de fórum e colaboração
- [ ] **v1.1**: Integração com mais LLMs e ferramentas
- [ ] **v1.2**: Análise avançada de código e contratação automática
- [ ] **v2.0**: Recursos enterprise e colaboração em equipe

---

**Transforme seu desenvolvimento de software. Tenha uma equipe de IA trabalhando para você.**
