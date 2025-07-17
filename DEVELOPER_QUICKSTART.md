# Developer Quick Start Guide 🚀

Welcome to Project Wiz! This guide will get you up and running in minutes.

## Prerequisites

- **Node.js** 18+ and npm 8+
- **Git** for version control
- **VS Code** (recommended) with the extensions listed in `.vscode/extensions.json`

## 🏃‍♂️ Quick Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/HD220/project-wiz.git
cd project-wiz

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start development
npm run dev
```

That's it! The application should now be running. 🎉

## 📝 Essential Commands

### Development
```bash
npm run dev              # Start app in development mode
npm run dev:debug        # Start with debugging enabled
npm run type-check:watch # Watch for TypeScript errors
```

### Code Quality
```bash
npm run quality:quick    # Quick lint + type check
npm run quality:check    # Full quality check (lint, types, format, tests)
npm run quality:fix      # Auto-fix issues where possible
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Open test UI
npm run test:coverage    # Generate coverage report
```

### Database
```bash
npm run db:studio        # Open database GUI
npm run db:migrate       # Apply migrations
npm run db:reset         # Reset database (caution!)
```

### Utilities
```bash
npm run deps:check       # Check for unused dependencies
npm run deps:circular    # Check for circular dependencies
npm run bundle:analyze   # Analyze bundle size
```

## 🏗️ Project Structure

```
src/
├── main/           # Electron main process (backend)
│   ├── domains/    # Business logic organized by domain
│   ├── ipc/        # IPC handlers for renderer communication
│   └── infrastructure/ # Database, logging, etc.
├── renderer/       # React UI (frontend)
│   ├── app/        # Routes and pages
│   ├── components/ # Reusable UI components
│   └── domains/    # Feature-specific components
└── shared/         # Shared types and constants
```

## 🔧 Configuration Files

- `.env` - Environment variables (API keys, etc.)
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - Linting rules
- `drizzle.config.ts` - Database ORM configuration

## 🐛 Debugging

### VS Code Launch Configurations
1. Press `F5` to start debugging
2. Use "Electron: Main" for backend debugging
3. Use "Electron: Renderer" for frontend debugging

### Chrome DevTools
- Press `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac) in the app

### Logging
- Main process logs: Check terminal output
- Renderer logs: Check browser DevTools console

## 💡 Tips for New Developers

1. **Type Safety First**: We use TypeScript strictly. No `any` types!
2. **Follow the Architecture**: Keep business logic in domains, UI in components
3. **Use Path Aliases**: Import with `@/components` instead of `../../components`
4. **Check CLAUDE.md**: Our AI assistant uses this file for context
5. **Run Quality Checks**: Before committing, run `npm run quality:quick`

## 🆘 Common Issues

### "Module not found" errors
```bash
npm run clean:deps  # Clean install dependencies
```

### Database errors
```bash
npm run db:reset    # Reset database
npm run db:migrate  # Re-apply migrations
```

### Build errors
```bash
npm run clean       # Clean build artifacts
npm run rebuild     # Rebuild native dependencies
```

## 📚 Next Steps

1. Read the full documentation in `/docs`
2. Check out `CLAUDE.md` for AI-assisted development
3. Explore the codebase starting with `src/main/main.ts`
4. Join our Discord/Slack for help (if available)

Happy coding! 🎈