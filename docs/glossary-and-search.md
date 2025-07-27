# Glossário e Busca de Documentação

Este documento facilita a descoberta de informações na documentação do Project Wiz através de palavras-chave, conceitos e links diretos.

## 🔍 Busca Rápida por Palavras-Chave

### **Conceitos Core**

- **Agent** → AI specialist working on your project → [User Guide](./user/README.md)
- **INLINE-FIRST** → Development philosophy → [Code Simplicity](./developer/code-simplicity-principles.md)
- **IPC** → Inter-Process Communication → [IPC Patterns](./developer/ipc-communication-patterns.md)
- **PRP** → Project Requirements & Planning → [PRP Documentation](./prps/README.md)
- **Service Layer** → Business logic pattern → [Database Patterns](./developer/database-patterns.md)

### **Technologies**

- **Drizzle ORM** → Database patterns → [Database Guide](./developer/database-patterns.md)
- **Electron** → Desktop app framework → [Developer Guide](./developer/README.md) + [Electron Guides](./technical-guides/electron/)
- **React** → Frontend framework → [Developer Guide](./developer/README.md)
- **SQLite** → Database → [Database Patterns](./developer/database-patterns.md)
- **TanStack Router** → Data loading → [Data Loading Patterns](./developer/data-loading-patterns.md)
- **TanStack Query** → Server state → [Data Loading Patterns](./developer/data-loading-patterns.md)
- **TypeScript** → Language → [Coding Standards](./developer/coding-standards.md)
- **Vercel AI SDK** → AI integration → [AI Integration](./technical-guides/ai-integration/)
- **Vitest** → Testing → [Developer Guide](./developer/README.md)

### **AI & LLM**

- **AI Integration** → [AI Integration Guides](./technical-guides/ai-integration/)
- **LLM Provider** → [Provider Patterns](./technical-guides/ai-integration/ai-sdk-provider-patterns.md)
- **Multi-Provider** → [Vercel AI SDK Guide](./technical-guides/ai-integration/vercel-ai-sdk-guide.md)
- **Provider Registry** → [Provider Registry Guide](./technical-guides/ai-integration/createProviderRegistry-implementation-guide.md)
- **Queue Processing** → [Queue Patterns](./technical-guides/ai-integration/queue-patterns-implementation.md)

### **Architecture & Patterns**

- **Data Loading Hierarchy** → [Data Loading Patterns](./developer/data-loading-patterns.md)
- **Database Migrations** → [Database Patterns](./developer/database-patterns.md)
- **Error Handling** → [Error Handling Patterns](./developer/error-handling-patterns.md)
- **File Structure** → [Folder Structure](./developer/folder-structure.md)
- **Service Pattern** → [Database Patterns](./developer/database-patterns.md)
- **Worker Threads** → [Worker Threads Guide](./technical-guides/electron/worker-threads-guide.md)

## 🏷️ Busca por Tags

### **#setup**

- [Developer Quick Start](./developer/README.md#quick-start-for-developers)
- [User Getting Started](./user/getting-started.md)
- [Contributing Guide](./developer/contributing.md)

### **#database**

- [Database Patterns](./developer/database-patterns.md)
- [Migration Workflow](./developer/database-patterns.md#mandatory-migration-workflow)
- [Service Layer](./developer/database-patterns.md#service-layer-patterns)

### **#frontend**

- [Data Loading Patterns](./developer/data-loading-patterns.md)
- [React Components](./developer/coding-standards.md)
- [TanStack Router](./developer/data-loading-patterns.md)

### **#backend**

- [IPC Communication](./developer/ipc-communication-patterns.md)
- [Service Layer](./developer/database-patterns.md)
- [Error Handling](./developer/error-handling-patterns.md)

### **#ai**

- [AI Integration](./technical-guides/ai-integration/)
- [Vercel AI SDK](./technical-guides/ai-integration/vercel-ai-sdk-guide.md)
- [Provider Patterns](./technical-guides/ai-integration/ai-sdk-provider-patterns.md)

### **#performance**

- [Async Patterns](./technical-guides/electron/nodejs-async-patterns.md)
- [Worker Threads](./technical-guides/electron/worker-threads-guide.md)
- [Code Simplicity](./developer/code-simplicity-principles.md)

### **#testing**

- [Developer Guide - Testing](./developer/README.md#testing-strategy)
- [Quality Checks](./developer/README.md#code-quality)

### **#planning**

- [Product Requirements](./planning/product-requirements.md)
- [System Features](./planning/system-features.md)
- [PRP Methodology](./prps/README.md)

## 📋 Busca por Tipo de Tarefa

### **"Como fazer..."**

- **Setup inicial** → [Developer Quick Start](./developer/README.md#quick-start-for-developers)
- **Criar funcionalidade** → [Adding New Feature](./developer/README.md#adding-a-new-feature)
- **Mudanças no banco** → [Database Workflow](./developer/database-patterns.md#mandatory-migration-workflow)
- **Comunicação IPC** → [IPC Patterns](./developer/ipc-communication-patterns.md)
- **Integrar IA** → [AI Integration](./technical-guides/ai-integration/)
- **Otimizar performance** → [Performance Guides](./technical-guides/electron/)
- **Contribuir código** → [Contributing Guide](./developer/contributing.md)

### **"Onde encontrar..."**

- **Arquivos de código** → [Folder Structure](./developer/folder-structure.md)
- **Padrões de desenvolvimento** → [Developer Guide](./developer/README.md)
- **Documentação de API** → [IPC Communication](./developer/ipc-communication-patterns.md)
- **Exemplos de código** → All developer docs have examples
- **Guias técnicos** → [Technical Guides](./technical-guides/)

### **"Por que..."**

- **INLINE-FIRST?** → [Code Simplicity Principles](./developer/code-simplicity-principles.md)
- **Hierarchy na Data Loading?** → [Data Loading Patterns](./developer/data-loading-patterns.md)
- **Service Layer?** → [Database Patterns](./developer/database-patterns.md)
- **Não localStorage?** → [IPC Communication](./developer/ipc-communication-patterns.md)

## 🎯 Busca por Nível de Experiência

### **Iniciante (0-1 mês)**

1. [User Guide](./user/README.md) - Entender o produto
2. [Developer Guide](./developer/README.md) - Overview técnico
3. [Code Simplicity](./developer/code-simplicity-principles.md) - Filosofia
4. [Contributing Guide](./developer/contributing.md) - Como contribuir

### **Intermediário (1-3 meses)**

1. [Data Loading Patterns](./developer/data-loading-patterns.md)
2. [Database Patterns](./developer/database-patterns.md)
3. [IPC Communication](./developer/ipc-communication-patterns.md)
4. [Error Handling](./developer/error-handling-patterns.md)

### **Avançado (3+ meses)**

1. [Technical Guides](./technical-guides/) - Implementações específicas
2. [AI Integration](./technical-guides/ai-integration/) - Features de IA
3. [Architecture Documentation](./developer/architecture/) - Design de sistema
4. [PRP Methodology](./prps/) - Planejamento avançado

## 🔗 Cross-References por Domínio

### **User Experience**

- Main: [User Documentation](./user/)
- Related: [Product Requirements](./planning/product-requirements.md)
- Technical: [System Features](./planning/system-features.md)

### **Frontend Development**

- Main: [Data Loading Patterns](./developer/data-loading-patterns.md)
- Related: [Coding Standards](./developer/coding-standards.md)
- Technical: [React Patterns](./developer/coding-standards.md)

### **Backend Development**

- Main: [Database Patterns](./developer/database-patterns.md)
- Related: [IPC Communication](./developer/ipc-communication-patterns.md)
- Technical: [Service Layer](./developer/database-patterns.md)

### **AI Development**

- Main: [AI Integration](./technical-guides/ai-integration/)
- Related: [Queue Patterns](./technical-guides/ai-integration/queue-patterns-implementation.md)
- Technical: [Provider Registry](./technical-guides/ai-integration/createProviderRegistry-implementation-guide.md)

### **DevOps & Deployment**

- Main: [Developer Guide](./developer/README.md)
- Related: [Contributing Guide](./developer/contributing.md)
- Technical: [Technical Guides](./technical-guides/) (deployment section coming)

## 🆘 Emergency Quick Reference

### **Não está funcionando?**

- **Setup issues** → [Developer Troubleshooting](./developer/README.md#common-pitfalls)
- **Database errors** → [Database Patterns](./developer/database-patterns.md#critical-migration-rules)
- **Build fails** → [Quality Checks](./developer/README.md#code-quality)
- **Tests failing** → [Testing Strategy](./developer/README.md#testing-strategy)

### **Preciso implementar rapidamente**

- **New feature** → [Adding New Feature](./developer/README.md#adding-a-new-feature)
- **Database change** → [Migration Workflow](./developer/database-patterns.md#mandatory-migration-workflow)
- **AI feature** → [AI Integration Quick Start](./technical-guides/ai-integration/README.md)
- **Performance fix** → [Performance Guides](./technical-guides/electron/)

### **Preciso entender o design**

- **Architecture** → [Developer Guide Overview](./developer/README.md#architecture-overview)
- **Patterns** → [Code Simplicity](./developer/code-simplicity-principles.md)
- **Decisions** → [Architecture Documentation](./developer/architecture/)

---

## 📝 Como Usar Este Glossário

1. **Busca por palavra-chave** - Use Ctrl+F para encontrar termos específicos
2. **Navegue por tags** - Encontre documentos relacionados por categoria
3. **Siga os links** - Cada entrada leva direto à documentação relevante
4. **Use cross-references** - Explore tópicos relacionados
5. **Consulte por nível** - Escolha conteúdo adequado à sua experiência

**💡 Dica:** Favoritar este documento facilita a navegação rápida na documentação!
