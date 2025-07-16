# Guia de Organização da Documentação do Project Wiz

## 1. Introdução e Princípios Orientadores

Este guia define a estrutura e os princípios para a organização da documentação do Project Wiz. Uma documentação bem organizada é crucial para a manutenibilidade do projeto, a colaboração da equipe e a facilitação da entrada de novos membros.

Adotamos uma abordagem inspirada no framework [Diátaxis](https://diataxis.fr/), que categoriza a documentação com base em seu propósito e na audiência, garantindo que a informação certa esteja no lugar certo.

### Princípios Fundamentais:

- **Foco na Audiência:** A documentação é dividida principalmente entre usuários finais e desenvolvedores/contribuidores.
- **Propósito Claro:** Cada seção da documentação tem um propósito bem definido (aprender, fazer, consultar, entender).
- **Facilidade de Descoberta:** A estrutura de diretórios e o uso de `README.md` em cada nível facilitam a navegação e a localização de informações.
- **Consistência:** Nomenclatura e formatação consistentes em toda a documentação.

## 2. Estrutura de Diretórios Principal (`/docs`)

A estrutura de alto nível dentro de `/docs` é simplificada e focada na audiência principal:

```
/docs
├── README.md               # Visão geral e índice principal da documentação
│
├── user/                   # Documentação para Usuários Finais do Project Wiz
│   ├── README.md           # Introdução ao usuário e índice da seção
│   ├── tutorials/          # Guias passo a passo para aprender a usar o sistema
│   ├── guides/             # Como realizar tarefas específicas (receitas)
│   └── concepts/           # Explicações sobre conceitos do usuário (o que são Jobs, Agentes, Personas)
│
├── developer/              # Documentação para Desenvolvedores e Contribuidores
│   ├── README.md           # Introdução para desenvolvedores e índice da seção
│   ├── tutorials/          # Guias passo a passo para desenvolvedores (setup, primeiros passos)
│   ├── guides/             # Como realizar tarefas de desenvolvimento (contribuir, depurar, testar)
│   ├── reference/          # Informação técnica precisa e consultável
│   │   ├── adrs/           # Registros de Decisões Arquiteturais (ADRs)
│   │   ├── design-records/ # Registros de Decisões de Design Global (GDRs)
│   │   └── ... (outras referências técnicas, como APIs, configurações)
│   ├── concepts/           # Explicações de alto nível, contexto e "porquês"
│   │   ├── product-requirements/ # Documentos de Requisitos de Produto (PRDs)
│   │   ├── roadmap/        # Roadmaps do Produto/Projeto
│   │   ├── research/       # Documentos de Pesquisa Técnica
│   │   ├── feature-planning/ # Planejamento e Design de Funcionalidades
│   │   └── ... (outros conceitos arquiteturais, padrões de design)
│   └── community/          # Informações sobre a comunidade e contribuição
│
└── assets/                 # Recursos estáticos (imagens, diagramas) compartilhados
```

## 3. Detalhamento das Categorias Diátaxis

### 3.1. Tutoriais (`tutorials/`)

- **Propósito:** Ajudar o leitor a aprender a usar o sistema ou uma ferramenta específica, seguindo um caminho passo a passo. São práticos e orientados a resultados.
- **Audiência:** Iniciantes.
- **Características:**
  - Passo a passo numerado.
  - Foco em "como fazer X".
  - Não explicam o "porquê" em profundidade, apenas o suficiente para seguir os passos.
  - Devem ser repetíveis e levar a um resultado concreto.
- **Exemplos:**

### 3.2. Guias (`guides/`)

- **Propósito:** Mostrar ao leitor como resolver um problema específico ou alcançar um objetivo. São mais focados em "como fazer Y" do que em "como aprender Y".
- **Audiência:** Pessoas que já têm algum conhecimento básico, mas precisam de ajuda para uma tarefa específica.
- **Características:**
  - Focados em um problema ou objetivo.
  - Podem ser mais longos e detalhados que tutoriais.
  - Podem incluir dicas e melhores práticas.
- **Exemplos:**

### 3.3. Referência (`reference/`)

- **Propósito:** Fornecer informações técnicas precisas e completas sobre partes do sistema. São organizados para consulta rápida, não para leitura sequencial.
- **Audiência:** Desenvolvedores experientes que precisam de detalhes específicos.
- **Características:**
  - Organizados por tópico (ex: API, configuração, padrões).
  - Focados em "o que é X".
  - Conteúdo denso, sem muita prosa.
  - Devem ser exaustivos e precisos.
- **Exemplos:**

### 3.4. Explicação (Concepts) (`concepts/`)

- **Propósito:** Fornecer contexto, visão geral e "porquês" por trás do sistema. Ajudam o leitor a construir um modelo mental do projeto.
- **Audiência:** Qualquer pessoa que precise entender o sistema em um nível mais profundo.
- **Características:**
  - Focados em "por que X" ou "como X funciona".
  - Podem incluir diagramas, analogias e discussões teóricas.
  - Não são práticos; são para compreensão.
- **Exemplos:**

Este guia servirá como a base para a organização da documentação do Project Wiz, garantindo clareza, consistência e facilidade de uso para todos os envolvidos.
