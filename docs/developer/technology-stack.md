# Technology Stack - Project Wiz

**Production-Ready AI Development Platform Technology Stack**

This document defines the canonical technology versions and configurations used throughout Project Wiz for consistent reference across all documentation.

## 🎯 Core Technology Stack

### **Desktop Application Framework**

- **Electron 35.1.4** - Latest stable with security updates and enterprise features
- **Forge Configuration** - Automated build and distribution
- **Security Model** - CSP, sandboxed renderers, secure IPC

### **Frontend Technologies**

- **React 19.0.0** - Function declarations (not React.FC), concurrent features
- **TypeScript 5.8.3** - Strict mode with full type inference
- **TanStack Router 1.115.2** - File-based routing with type safety
- **TanStack Query 5.83.0** - Server state management and caching
- **shadcn/ui 48+ components** - Production-ready component library
- **Tailwind CSS 4** - Utility-first styling with design tokens

### **Backend & Data Layer**

- **SQLite** - Embedded database with WAL mode
- **Drizzle ORM 0.44.2** - Type-safe database queries and migrations
- **Node.js** - Electron main process runtime
- **Type-Safe IPC** - Secure main-renderer communication

### **AI Integration**

- **Vercel AI SDK v4** - Multi-provider AI integration
- **OpenAI, Anthropic, Local Models** - Provider flexibility
- **Streaming Support** - Real-time AI response handling

### **Development & Quality**

- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Vitest** - Testing framework
- **LinguiJS** - Internationalization
- **Automated Type Safety** - End-to-end TypeScript coverage

## 📋 Standard Technology References

When referencing technologies in documentation, use these standardized descriptions:

### **Primary Stack Description** (for README/overview documents)

```
Project Wiz is built with Electron 35.1.4, React 19, TypeScript 5.8.3, and Vercel AI SDK v4 for production-ready AI development automation.
```

### **Technical Implementation Description** (for technical guides)

```
Current Implementation: Electron 35.1.4 + React 19.0.0 + TypeScript 5.8.3 + TanStack Router 1.115.2 + Drizzle ORM 0.44.2
```

### **Component/Feature Description** (for specific features)

```
[Feature] with React 19, TanStack Router/Query, and shadcn/ui components
```

## 🔧 Configuration Standards

### **Package Versions** (for dependency updates)

```json
{
  "electron": "35.1.4",
  "react": "19.0.0",
  "@types/react": "^18.2.0",
  "typescript": "5.8.3",
  "@tanstack/router": "1.115.2",
  "@tanstack/react-query": "5.83.0",
  "drizzle-orm": "0.44.2",
  "ai": "^3.0.0"
}
```

### **Environment Configuration**

- **Development**: Hot reloading, dev tools, source maps
- **Production**: Security hardening, performance optimization
- **Testing**: Isolated test environment with mocked dependencies

## 🚀 Version Update Policy

### **Major Updates**

- Electron: Update within 30 days of stable release
- React: Update after community stability (3+ months)
- TypeScript: Update with feature releases

### **Minor Updates**

- Security patches: Immediate
- Feature updates: Monthly review cycle
- Dependency updates: Automated with testing

### **Documentation Sync**

- All documentation updated within 1 week of version changes
- Version references maintained in this canonical document
- Cross-references updated via automated tooling

## 🔗 Related Documentation

### **Implementation Guides**

- **[Coding Standards](./coding-standards.md)** - TypeScript and React patterns using these versions
- **[Database Patterns](./database-patterns.md)** - Drizzle ORM implementation with SQLite
- **[IPC Communication](./ipc-communication-patterns.md)** - Electron IPC patterns and security

### **Technical Guides**

- **[Electron Guide](../technical-guides/electron/README.md)** - Desktop framework implementation
- **[Frontend Guide](../technical-guides/frontend/README.md)** - React and TanStack patterns
- **[AI Integration](../technical-guides/ai-integration/README.md)** - Vercel AI SDK implementation

---

**📋 Maintenance**: This document is the single source of truth for technology versions. Update this document first when versions change, then sync all references throughout the documentation system.
