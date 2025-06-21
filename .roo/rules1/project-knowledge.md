# Project Wiz: Documentação de Conhecimento

---

## 1. Visão Geral do Projeto

* **Título do Projeto:** Project Wiz
* **Data de Início:** [Informação Não Disponível]
* **Última Atualização:** 13/06/2025
* **Propósito/Objetivo:** Sistema ElectronJS para automatizar tarefas de desenvolvimento usando modelos LLM (Large Language Models) localmente, permitindo que a LLM trabalhe de forma autônoma em repositórios GitHub.
* **Stakeholders Principais:** 
  - Nicolas Fraga Faust (autor/maintainer)
  - Equipe de desenvolvimento
  - Usuários finais (desenvolvedores)
* **Escopo:** 
  - Geração de código
  - Análise de código
  - Criação de pull requests
  - Geração de documentação
  - Análise de issues
  - Configuração de parâmetros dos modelos
  - Definição de fluxos de trabalho
* **Tecnologias Envolvidas:**
  - ElectronJS
  - React 19
  - TypeScript
  - Vite
  - Drizzle ORM
  - TailwindCSS
  - Zod
  - Lingui (i18n)
  - Vitest
  - Octokit (GitHub API)

---

## 2. Organização e Estrutura do Repositório

* **Estrutura de Pastas Principais:**
  ```
  project-wiz/
  ├── src/
  │   ├── core/         # Lógica de domínio
  │   ├── infrastructure/ # Implementações concretas
  │   └── shared/       # Utilitários compartilhados
  ├── docs/            # Documentação do sistema
  ├── migrations/      # Migrações de banco de dados
  └── tests/           # Testes automatizados
  ```
* **Convenções de Nomenclatura:** 
  - Uso de paths aliases (@/components, @/lib, etc.)
  - Pastas em inglês
  - Nomes descritivos para componentes e funções
* **Controle de Versão:** 
  - Git
  - Estratégia de branches não especificada
  - Mensagens de commit em inglês
* **Ambientes:**
  - Desenvolvimento: npm run dev
  - Produção: npm run build

---

## 3. Padrões de Desenvolvimento

* **Padrões de Código:**
  - **TypeScript:**
    - Configuração strict ativada (noImplicitAny, strictNullChecks)
    - Path aliases (@/components, @/lib, etc.)
    - Tipagem forte (evitar 'any' quando possível)
  - **ESLint:**
    - Configuração estendida:
      - eslint:recommended
      - @typescript-eslint/recommended
      - import/recommended
    - Regras customizadas:
      - Permite non-null assertions
      - Permite funções vazias
      - Permite explicit any (com moderação)
    - Organização de imports (plugin:import)
  - **Formatação:**
    - Prettier para consistência
    - Indentação de 2 espaços
    - Aspas simples
    - Ponto e vírgula opcional
* **Testes:**
  - Vitest para testes unitários e de integração
  - Cobertura de testes (npm run test:coverage)
* **Documentação:**
  - Mantida na pasta docs/
  - Inclui ADRs (Architecture Decision Records)
  - Monitoramento automatizado de qualidade
* **Tratamento de Erros:**
  - Zod para validação
  - Try/catch para tratamento de exceções
* **Segurança:**
  - CSP com nonce dinâmico
  - Geração segura de tokens
  - Validação rigorosa de inputs
* **Performance:**
  - Vite para build otimizado
  - Code splitting automático

---

## 4. Arquitetura do Sistema

* **Visão Geral da Arquitetura:**
  - Aplicação Electron com processo main e renderer
  - Frontend em React com TanStack Router
  - Internacionalização com Lingui
  - ORM Drizzle para banco de dados
* **Componentes Principais:**
  - **Processo Main (Electron):**
    - Manipulação de janelas e lifecycle
    - Comunicação IPC
    - Gerenciamento de agentes
    - Integração com GitHub API
  - **Processo Renderer (React):**
    - Interface baseada em componentes
    - Roteamento com TanStack Router
    - UI com Radix + Tailwind
  - **Core Domain:**
    - Entidades e Value Objects
    - Casos de uso
    - Ports/Interfaces
* **Fluxos de Dados:**
  - Frontend -> Backend via IPC
  - Backend -> GitHub API via Octokit
  - Persistência com Drizzle ORM
* **Mecanismos de Comunicação:**
  - IPC Electron tipado
  - REST para GitHub API
* **Armazenamento de Dados:**
  - SQLite com Drizzle ORM
  - Migrações versionadas
* **Implantação:**
  - Electron Forge para empacotamento
  - Vite para build otimizado

---

## 5. Próximos Passos e Observações

* **Pontos de Dúvida/Melhoria:**
  - Detalhes da estratégia de CI/CD
  - Configurações específicas de ambientes
* **Considerações Adicionais:**
  - Boa cobertura de testes
  - Internacionalização implementada
  - Arquitetura bem definida