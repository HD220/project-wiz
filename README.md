# Project Wiz - Automação de Tarefas de Desenvolvimento com LLMs

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Visão Geral

Project Wiz é um sistema ElectronJS para automatizar tarefas de desenvolvimento usando modelos LLM (Large Language Models) localmente. Ele permite que a LLM trabalhe de forma autônoma, executando tarefas como um desenvolvedor em repositórios GitHub.

## Funcionalidades Principais

✅ **Automação de Tarefas**

- Geração de código
- Análise de código
- Criação de pull requests
- Geração de documentação
- Análise de issues

🎛️ **Controle e Personalização**

- Configuração de parâmetros dos modelos (temperatura, prompts)
- Definição de fluxos de trabalho
- Personalização de prompts

🔌 **Integrações**

- GitHub (via Octokit)
- Modelos LLM locais (ex: Mistral, Llama 2)
- Comunicação IPC entre processos

🌐 **Internacionalização**

- Suporte a múltiplos idiomas (pt-BR, en)
- Fácil adição de novos idiomas

## Pré-requisitos

- Node.js 18+
- npm 9+
- Python 3.8+ (para alguns modelos)

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/project-wiz.git
cd project-wiz

# Instalar dependências
npm install

# Instalar o babel-jest (necessário para testes de componentes React)
npm install --save-dev babel-jest @babel/core @babel/preset-env

# Iniciar a aplicação
npm run dev
```

## Uso Básico

1. Inicie a aplicação com `npm run dev`
2. Configure os repositórios GitHub na seção "Repository Settings".
3. Configure os modelos LLM na seção "Model Settings".
4. Defina os fluxos de trabalho para automatizar as tarefas desejadas.
5. Monitore o progresso das tarefas no "Activity Log".

## Estrutura do Projeto

```
project-wiz/
├── src/
│   ├── client/       # Interface do usuário (React)
│   ├── core/         # Lógica principal e comunicação Electron
│   └── locales/      # Internacionalização (i18n)
├── docs/            # Documentação do sistema
└── tests/           # Testes automatizados
```

Para detalhes completos da arquitetura, consulte [Documentação de Contexto do Projeto](docs/project-context.md).

## Desenvolvimento

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Roadmap

- Versão 1.0 (30/04/2025): Documentação completa
- Versão 1.1 (15/05/2025): Suporte a múltiplos modelos LLM GUFF

Consulte o [roadmap completo](docs/project-context.md#próximos-marcos) para mais detalhes.

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## Documentação Completa

- [Visão Geral do Projeto](docs/index.md)
- [Configuração TS/Vite](docs/ts-vite-config.md)
- [Componentes UI](docs/ui-components.md)
- [Serviços LLM](docs/llm-services.md)
