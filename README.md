# 🧙‍♂️ Project Wiz

> **Aplicação desktop para automação do ciclo de vida de desenvolvimento de software com Agentes de IA**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-191970?logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

Project Wiz é uma plataforma desktop inovadora que combina inteligência artificial com gestão de projetos para revolucionar o desenvolvimento de software. Com agentes de IA personalizáveis, colaboração em equipe e integração com múltiplos provedores de LLM, o Project Wiz automatiza tarefas repetitivas e acelera o ciclo de desenvolvimento.

## ✨ Principais Funcionalidades

### 🤖 Agentes de IA Inteligentes

- **Agentes Personalizáveis**: Crie assistentes de IA com roles, backstories e objetivos específicos
- **Multi-Provider**: Suporte para OpenAI, Anthropic, DeepSeek, Google e provedores customizados
- **Configuração Flexível**: Modelos e configurações adaptáveis para diferentes necessidades

### 🚀 Gestão de Projetos Avançada

- **Integração Git**: Conecte repositórios e branches automaticamente
- **Organização Intuitiva**: Gerencie projetos com descrições, avatares e paths locais
- **Colaboração**: Trabalhe em equipe com canais de comunicação dedicados

### 💬 Comunicação Integrada

- **Canais de Projeto**: Conversas organizadas por projeto com histórico completo
- **Mensagens Diretas**: Comunicação privada entre membros da equipe
- **Chat com IA**: Interaja diretamente com seus agentes de IA

### 🔐 Segurança Enterprise

- **Autenticação Robusta**: Sistema de login e registro com sessões seguras
- **Dados Locais**: SQLite local para controle total dos seus dados
- **Criptografia**: Proteção de chaves de API e informações sensíveis

## 🛠️ Stack Tecnológica

### Frontend

- **React 19** - Interface moderna e responsiva
- **TanStack Router** - Roteamento declarativo e type-safe
- **TanStack Query** - Gerenciamento de estado e cache
- **Tailwind CSS** - Estilização utilitária
- **Radix UI** - Componentes acessíveis e customizáveis

### Backend

- **Electron** - Aplicação desktop multiplataforma
- **Node.js** - Runtime JavaScript
- **SQLite + Drizzle ORM** - Base de dados local com queries type-safe
- **IPC Handlers** - Comunicação segura entre processos

### IA & Integrações

- **Vercel AI SDK** - Integração unificada com LLMs
- **Multi-Provider Support** - OpenAI, Anthropic, DeepSeek, Google
- **Processamento Markdown** - Renderização rica de mensagens
- **Git Integration** - Automação de workflows de desenvolvimento

### Desenvolvimento

- **TypeScript** - Type safety em toda aplicação
- **Vite** - Build tool moderna e rápida
- **Vitest** - Testing framework
- **ESLint + Prettier** - Qualidade de código
- **LinguiJS** - Internacionalização (PT/EN)

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/HD220/project-wiz.git

# Entre no diretório
cd project-wiz

# Instale as dependências
npm install

```

### Execução

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Testes
npm run test

# Verificação de qualidade
npm run quality:check
```

## 📁 Arquitetura

### Estrutura Multi-Processo

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Main Process   │    │ Renderer Process │    │ Worker Process  │
│  (Backend)      │◄──►│   (Frontend)    │◄──►│  (Background)   │
│                 │    │                 │    │                 │
│ • IPC Handlers  │    │ • React UI      │    │ • AI Processing │
│ • Database      │    │ • State Mgmt    │    │ • Queue Jobs    │
│ • File System   │    │ • Routing       │    │ • LLM Calls     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Organização de Código

```
src/
├── main/          # Processo principal (Node.js)
│   ├── ipc/       # Handlers IPC organizados por domínio
│   ├── schemas/   # Schemas do banco de dados
│   └── services/  # Serviços do sistema
├── renderer/      # Interface do usuário (React)
│   ├── app/       # Roteamento baseado em arquivos
│   ├── features/  # Features organizadas por domínio
│   └── components/ # Componentes reutilizáveis
├── shared/        # Código compartilhado
│   ├── types/     # Tipos TypeScript
│   └── services/  # Serviços cross-process
└── worker/        # Processamento em background
    ├── processors/ # Processadores de jobs
    └── queue/     # Sistema de filas
```

## 🎯 Casos de Uso

### Para Desenvolvedores

- Automatize code reviews com agentes especializados
- Configure assistentes para diferentes tecnologias
- Gerencie múltiplos projetos em uma interface única
- Colabore com equipes usando canais dedicados

### Para Equipes

- Crie agentes especializados em arquitetura, testes, documentação
- Centralize comunicação de projetos
- Mantenha histórico de decisões e discussões
- Integre workflows de desenvolvimento

### Para Empresas

- Deploy local para controle total dos dados
- Configuração de provedores de IA corporativos
- Gestão de permissões e acesso
- Integração com ferramentas empresariais

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
npm run dev              # Inicia aplicação em modo desenvolvimento
npm run db:studio        # Abre Drizzle Studio
npm run db:generate      # Gera migrações do banco
npm run extract          # Extrai strings para i18n
```

### Qualidade

```bash
npm run lint             # Verifica código com ESLint
npm run type-check       # Verifica tipos TypeScript
npm run format           # Formata código com Prettier
npm run test:coverage    # Testes com coverage
```

### Build

```bash
npm run build           # Build completo da aplicação
npm run package         # Gera executável
```

## 🌍 Internacionalização

Suporte completo para:

- 🇧🇷 **Português (Brasil)** - Idioma padrão
- 🇺🇸 **English (US)** - Totalmente traduzido

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- 🐛 **Issues**: [GitHub Issues](https://github.com/HD220/project-wiz/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/HD220/project-wiz/discussions)
- 📧 **Email**: project-wiz@example.com

---

<div align="center">
  <p>Feito com ❤️ pela equipe Project Wiz</p>
  <p>
    <a href="#-project-wiz">Topo ↑</a>
  </p>
</div>
