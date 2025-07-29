# Technical Implementation Guides

Advanced technical guides for specialized implementation patterns in Project Wiz - a production-ready AI-powered software development automation platform with Electron 35.1.4, React 19, and Vercel AI SDK v4.

## 🎯 Quick Navigation

### **By Technology**

- **🤖 AI Integration** → [AI Implementation](#🤖-ai-integration-guides)
- **🎨 Frontend & Routing** → [Frontend Guides](#🎨-frontend--routing-guides)
- **⚡ Electron & Performance** → [Electron Guides](#⚡-electron--performance-guides)
- **🧪 Testing & Quality** → [Testing Guides](#🧪-testing--quality-guides)
- **🚀 Deployment** → [Deployment Guides](#🚀-deployment-guides)

### **By Use Case**

- **Adding AI features** → Start with [AI SDK Guide](./ai-integration/vercel-ai-sdk-guide.md)
- **Frontend routing & auth** → [TanStack Router Authentication](./frontend/tanstack-router-authentication-guide.md)
- **Background processing** → [Worker Threads](./electron/worker-threads-guide.md) + [Queue Patterns](./ai-integration/queue-patterns-implementation.md)
- **Performance optimization** → [Async Patterns](./electron/nodejs-async-patterns.md)
- **Testing implementation** → [Testing Strategies](#🧪-testing--quality-guides)

---

## 🤖 AI Integration Guides

_Production-ready AI SDK v4.3.16 with multi-provider support and encrypted storage_

### 🌟 **Essential Reading** _(~90 min total)_

- **[📖 AI Integration Overview](./ai-integration/README.md)** - Production AI architecture with Vercel AI SDK v4 **(20 min)**
- **[🔧 Vercel AI SDK v4 Guide](./ai-integration/vercel-ai-sdk-guide.md)** - Multi-provider implementation patterns **(25 min)**
- **[📦 Provider Patterns](./ai-integration/ai-sdk-provider-patterns.md)** - AES-256-GCM encryption and failover **(20 min)**
- **[⚡ Queue Patterns](./ai-integration/queue-patterns-implementation.md)** - Background AI processing **(25 min)**

### 📚 **Deep Dive Documentation**

- **[🔬 AI SDK Research](./ai-integration/ai-sdk-comprehensive-research.md)** - Technical analysis and comparisons
- **[🏗️ Provider Registry Guide](./ai-integration/createProviderRegistry-implementation-guide.md)** - Custom provider implementation

**🎯 Use Cases:** OpenAI/Anthropic/DeepSeek providers, encrypted API keys, memory systems, conversation handling

---

## 🎨 Frontend & Routing Guides

_React 19.0.0 with TanStack Router v1.115.2 and 48+ shadcn/ui components_

### 🌟 **TanStack Router Essentials** _(~80 min total)_

- **[📖 Frontend Architecture](./frontend/README.md)** - React 19 + TanStack Router patterns **(15 min)**
- **[🔐 Authentication Guide](./frontend/tanstack-router-authentication-guide.md)** - Session-based auth implementation **(30 min)**
- **[📊 Data Loading Guide](./frontend/tanstack-router-data-loading-guide.md)** - Mandatory hierarchy patterns **(25 min)**
- **[🔄 Contexts Guide](./frontend/tanstack-router-contexts-guide.md)** - Context management **(10 min)**

### 📚 **Research & Analysis**

- **[🔬 Authentication Research](./frontend/tanstack-router-authentication-research.md)** - Technical analysis and decisions

**🎯 Use Cases:** File-based routing, beforeLoad/loader patterns, type-safe IPC, 48+ components

---

## ⚡ Electron & Performance Guides

_Electron 35.1.4 with enterprise security, SQLite WAL mode, and type-safe IPC_

### 🌟 **Performance Essentials** _(~60 min total)_

- **[⚡ Electron Architecture](./electron/README.md)** - Production Electron 35 + security patterns **(20 min)**
- **[🧵 Worker Threads Guide](./electron/worker-threads-guide.md)** - Background processing patterns **(20 min)**
- **[🔄 Async Patterns](./electron/nodejs-async-patterns.md)** - Node.js async best practices **(20 min)**

**🎯 Use Cases:** Type-safe IPC, database optimization, security hardening, main process architecture

---

## 🧪 Testing & Quality Guides

_Testing strategies, patterns, and best practices_

### 📋 **Testing Foundation** _(Future Enhancement)_

**Status**: Deferred until post-MVP phase

Planned coverage:

- Testing strategies for service layer and IPC communication
- AI feature testing patterns and mocking strategies
- E2E testing for Electron applications

---

## 🚀 Deployment Guides

_Build, packaging, and deployment strategies_

### 📋 **Production Deployment** _(Future Enhancement)_

**Status**: Deferred until production deployment phase

Planned coverage:

- Electron Forge production builds and packaging
- Multi-platform distribution strategies
- Auto-update mechanisms and CI/CD integration

---

## 🔍 Find What You Need

### **By Experience Level**

- **Beginner:** Start with [Developer Guide](../developer/README.md), then return here
- **Intermediate:** Choose guides based on your implementation needs
- **Advanced:** Deep dive into research docs and implementation guides

### **By Implementation Timeline**

- **Quick Reference** _(5-10 min)_: README files in each directory
- **Implementation Guide** _(20-30 min)_: Step-by-step implementation docs
- **Deep Research** _(60+ min)_: Comprehensive analysis and comparison docs

### **Common Learning Paths**

1. **AI Features:** AI Integration → Vercel SDK → Provider Patterns → Queue Patterns
2. **Frontend Development:** TanStack Router Auth → Data Loading → Context Management
3. **Performance:** Async Patterns → Worker Threads → Electron Optimization
4. **Full Stack:** All Frontend guides + All AI guides + All Electron guides + Testing strategies

---

## 🔗 Related Documentation

### **Prerequisites**

- **[Developer Guide](../developer/README.md)** - Core development patterns and setup
- **[Code Simplicity Principles](../developer/code-simplicity-principles.md)** - Development philosophy
- **[Architecture Patterns](../developer/)** - Foundation patterns (Data, Database, IPC, Error handling)

### **Cross-References**

- **[Planning Documentation](../planning/)** - Product requirements and strategy
- **[User Documentation](../user/)** - End-user perspective
- **[PRP Documentation](../prps/)** - Project requirements and planning methodology

### 🔙 **Navigation**

- **[← Back to Main Documentation](../README.md)**
- **[📖 Developer Guide](../developer/README.md)** - Core development patterns
- **[👤 User Documentation](../user/README.md)** - End-user guides

---

## 🤝 Contributing to Technical Guides

When adding new technical guides:

### **Structure Requirements**

1. **Create appropriate subdirectory** if it doesn't exist
2. **Follow consistent naming:** `kebab-case.md`
3. **Include time estimates** for reading
4. **Add practical examples** and code snippets
5. **Cross-reference** with related guides

### **Content Standards**

- **Start with overview** - What problem does this solve?
- **Include use cases** - When to apply these patterns
- **Provide examples** - Concrete implementation examples
- **Add troubleshooting** - Common issues and solutions
- **Link to related docs** - Help readers navigate

### **Quality Checklist**

- [ ] Time estimate included
- [ ] Prerequisites clearly stated
- [ ] Working code examples included
- [ ] Cross-references added
- [ ] Navigation links updated
- [ ] Main index updated (this file)

**Goal:** Enable developers to implement specific technical features confidently and efficiently.
