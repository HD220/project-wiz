# Project Wiz: Estratégia de Testes

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17  

---

## 🎯 Visão Geral da Estratégia de Testes

O Project Wiz adota uma **estratégia de testes pragmática e eficiente**, focada em **qualidade sem complexidade excessiva**. Nossa abordagem prioriza:

1. **Testes úteis** - Que realmente previnem bugs
2. **Manutenibilidade** - Fáceis de atualizar quando o código muda
3. **Velocidade** - Execução rápida para feedback imediato
4. **Confiança** - Cobertura adequada para deploy seguro

---

## 🏗️ Pirâmide de Testes

### Distribuição de Testes

```
        /\
       /  \
      / E2E \ (10% - Poucos, críticos)
     /______\
    /        \
   /Integration\ (20% - Fluxos principais)
  /____________\
 /              \
/   Unit Tests   \ (70% - Maioria, rápidos)
/________________\
```

### Justificativa da Distribuição

**70% Unit Tests**
- Rápidos de executar (< 1s cada)
- Fáceis de debuggar
- Testam lógica de negócio isolada
- Feedback imediato

**20% Integration Tests**
- Testam comunicação entre módulos
- Verificam fluxos completos
- Incluem testes de banco de dados
- Testam IPC entre main/renderer

**10% E2E Tests**
- Testam cenários críticos de usuário
- Validam interface completa
- Garantem que tudo funciona junto
- Executam mais lentamente

---

## 🔧 Configuração de Testes

### Vitest Configuration

```typescript
// vitest.config.mts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/', 'dist/', 'out/'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main/main.ts', // Entry point do Electron
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/main': path.resolve(__dirname, './src/main'),
      '@/renderer': path.resolve(__dirname, './src/renderer'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
```

### Test Setup Global

```typescript
// src/test/setup.ts
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock global APIs
global.window = Object.assign(global.window, {
  api: {
    projects: {
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    agents: {
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
      updateStatus: vi.fn(),
    },
    messages: {
      send: vi.fn(),
      listByChannel: vi.fn(),
      listByDM: vi.fn(),
    },
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    },
  },
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock Electron APIs
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    send: vi.fn(),
  },
  app: {
    getPath: vi.fn().mockReturnValue('/mock/path'),
  },
}));
```

---

## 🧪 Unit Tests - 70% dos testes

### Testando Services/Business Logic

```typescript
// src/main/domains/projects/project-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectService } from './project-service';
import { CreateProjectSchema } from './project-schemas';
import * as db from '@/infrastructure/database';

// Mock do banco
vi.mock('@/infrastructure/database');

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar projeto com dados válidos', async () => {
      // Arrange
      const validInput = {
        name: 'Test Project',
        description: 'Test description',
        ownerId: 'user-123',
      };

      const mockProject = {
        id: 'project-456',
        ...validInput,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockProject]),
        }),
      });

      // Act
      const result = await ProjectService.create(validInput);

      // Assert
      expect(result).toEqual(mockProject);
      expect(db.insert).toHaveBeenCalledWith(expect.any(Object));
    });

    it('deve falhar com dados inválidos', async () => {
      // Arrange
      const invalidInput = {
        name: '', // Nome vazio é inválido
        ownerId: 'user-123',
      };

      // Act & Assert
      await expect(ProjectService.create(invalidInput))
        .rejects
        .toThrow('Project name must be at least 3 characters');
    });

    it('deve gerar ID único para cada projeto', async () => {
      const input = {
        name: 'Test Project',
        ownerId: 'user-123',
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            { id: 'project-1', ...input },
          ]),
        }),
      });

      const project1 = await ProjectService.create(input);
      const project2 = await ProjectService.create(input);

      expect(project1.id).not.toBe(project2.id);
    });
  });

  describe('findById', () => {
    it('deve retornar projeto existente', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'Test Project',
        ownerId: 'user-456',
      };

      vi.mocked(db.query.projects.findFirst).mockResolvedValue(mockProject);

      const result = await ProjectService.findById('project-123');

      expect(result).toEqual(mockProject);
    });

    it('deve retornar null para projeto inexistente', async () => {
      vi.mocked(db.query.projects.findFirst).mockResolvedValue(undefined);

      const result = await ProjectService.findById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
```

### Testando Value Objects

```typescript
// src/main/domains/projects/value-objects/project-name.test.ts
import { describe, it, expect } from 'vitest';
import { ProjectName } from './project-name';

describe('ProjectName', () => {
  describe('constructor', () => {
    it('deve aceitar nome válido', () => {
      expect(() => new ProjectName('Valid Project')).not.toThrow();
    });

    it('deve rejeitar nome muito curto', () => {
      expect(() => new ProjectName('ab')).toThrow(
        'Project name must be at least 3 characters'
      );
    });

    it('deve rejeitar nome muito longo', () => {
      const longName = 'a'.repeat(101);
      expect(() => new ProjectName(longName)).toThrow(
        'Project name cannot exceed 100 characters'
      );
    });

    it('deve rejeitar nome com caracteres especiais', () => {
      expect(() => new ProjectName('Project@#$')).toThrow(
        'Project name contains invalid characters'
      );
    });
  });

  describe('getValue', () => {
    it('deve retornar o valor correto', () => {
      const name = new ProjectName('My Project');
      expect(name.getValue()).toBe('My Project');
    });
  });

  describe('equals', () => {
    it('deve retornar true para nomes iguais', () => {
      const name1 = new ProjectName('Project A');
      const name2 = new ProjectName('Project A');
      
      expect(name1.equals(name2)).toBe(true);
    });

    it('deve retornar false para nomes diferentes', () => {
      const name1 = new ProjectName('Project A');
      const name2 = new ProjectName('Project B');
      
      expect(name1.equals(name2)).toBe(false);
    });
  });
});
```

### Testando React Components

```typescript
// src/renderer/components/project/project-card.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from './project-card';

const mockProject = {
  id: 'project-123',
  name: 'Test Project',
  description: 'Test project description',
  status: 'active' as const,
  createdAt: new Date('2024-01-15'),
  memberCount: 5,
};

describe('ProjectCard', () => {
  it('deve renderizar informações do projeto', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test project description')).toBeInTheDocument();
    expect(screen.getByText('5 members')).toBeInTheDocument();
  });

  it('deve mostrar status do projeto', () => {
    render(<ProjectCard project={mockProject} />);

    const statusBadge = screen.getByText('Active');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('deve chamar onClick quando clicado', async () => {
    const handleClick = vi.fn();
    
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledWith(mockProject.id);
    });
  });

  it('deve mostrar loading state quando carregando', () => {
    render(
      <ProjectCard 
        project={mockProject} 
        isLoading={true}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
  });

  it('deve mostrar projeto arquivado corretamente', () => {
    const archivedProject = {
      ...mockProject,
      status: 'archived' as const,
    };

    render(<ProjectCard project={archivedProject} />);

    const statusBadge = screen.getByText('Archived');
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });
});
```

### Testando Custom Hooks

```typescript
// src/renderer/hooks/use-projects.test.tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProjects } from './use-projects';

// Mock da API
const mockApi = {
  projects: {
    findByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

// @ts-ignore
global.window.api = mockApi;

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar projetos na inicialização', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' },
    ];

    mockApi.projects.findByUser.mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjects('user-123'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.projects).toEqual(mockProjects);
    expect(mockApi.projects.findByUser).toHaveBeenCalledWith('user-123');
  });

  it('deve criar novo projeto', async () => {
    const newProject = { id: '3', name: 'New Project' };
    const projectData = { name: 'New Project', ownerId: 'user-123' };

    mockApi.projects.findByUser.mockResolvedValue([]);
    mockApi.projects.create.mockResolvedValue(newProject);

    const { result } = renderHook(() => useProjects('user-123'));

    await act(async () => {
      const created = await result.current.createProject(projectData);
      expect(created).toEqual(newProject);
    });

    expect(mockApi.projects.create).toHaveBeenCalledWith(projectData);
    expect(result.current.projects).toContain(newProject);
  });

  it('deve lidar com erro na criação', async () => {
    const error = new Error('Creation failed');
    
    mockApi.projects.findByUser.mockResolvedValue([]);
    mockApi.projects.create.mockRejectedValue(error);

    const { result } = renderHook(() => useProjects('user-123'));

    await act(async () => {
      await expect(
        result.current.createProject({ name: 'Test', ownerId: 'user-123' })
      ).rejects.toThrow('Creation failed');
    });

    expect(result.current.projects).toHaveLength(0);
  });
});
```

---

## 🔗 Integration Tests - 20% dos testes

### Testando Database Operations

```typescript
// src/main/domains/projects/project-integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/infrastructure/database';
import { projects } from '@/persistence/schemas';
import { ProjectService } from './project-service';

describe('Project Integration Tests', () => {
  beforeEach(async () => {
    // Setup test database
    await db.delete(projects);
  });

  afterEach(async () => {
    // Cleanup
    await db.delete(projects);
  });

  it('deve criar e buscar projeto no banco real', async () => {
    // Create
    const projectData = {
      name: 'Integration Test Project',
      description: 'Test description',
      ownerId: 'user-123',
    };

    const created = await ProjectService.create(projectData);

    expect(created).toMatchObject(projectData);
    expect(created.id).toBeDefined();
    expect(created.createdAt).toBeInstanceOf(Date);

    // Find
    const found = await ProjectService.findById(created.id);

    expect(found).toEqual(created);
  });

  it('deve listar projetos do usuário ordenados por data', async () => {
    // Create multiple projects with delays to ensure different timestamps
    const user1 = 'user-1';
    const user2 = 'user-2';

    const project1 = await ProjectService.create({
      name: 'Project 1',
      ownerId: user1,
    });

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const project2 = await ProjectService.create({
      name: 'Project 2',
      ownerId: user1,
    });

    const project3 = await ProjectService.create({
      name: 'Project 3',
      ownerId: user2,
    });

    // Test listing for user1
    const user1Projects = await ProjectService.findByUser(user1);

    expect(user1Projects).toHaveLength(2);
    expect(user1Projects[0].name).toBe('Project 2'); // More recent first
    expect(user1Projects[1].name).toBe('Project 1');

    // Test listing for user2
    const user2Projects = await ProjectService.findByUser(user2);

    expect(user2Projects).toHaveLength(1);
    expect(user2Projects[0].name).toBe('Project 3');
  });

  it('deve atualizar projeto e preservar dados relacionados', async () => {
    // Create project with channels
    const project = await ProjectService.create({
      name: 'Original Name',
      description: 'Original description',
      ownerId: 'user-123',
    });

    // Create some channels for the project
    await ChannelService.create({
      name: 'general',
      projectId: project.id,
      createdBy: 'user-123',
    });

    // Update project
    const updated = await ProjectService.update(project.id, {
      name: 'Updated Name',
      description: 'Updated description',
    });

    expect(updated.name).toBe('Updated Name');
    expect(updated.description).toBe('Updated description');
    expect(updated.id).toBe(project.id); // ID should not change

    // Verify channels still exist
    const channels = await ChannelService.findByProject(project.id);
    expect(channels).toHaveLength(1);
  });
});
```

### Testando IPC Communication

```typescript
// src/test/integration/ipc.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ipcMain, ipcRenderer } from 'electron';
import { setupProjectsHandlers } from '@/main/ipc/projects.handlers';

describe('IPC Communication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupProjectsHandlers();
  });

  it('deve criar projeto via IPC', async () => {
    const projectData = {
      name: 'IPC Test Project',
      description: 'Created via IPC',
      ownerId: 'user-123',
    };

    // Simulate IPC call from renderer
    const result = await ipcRenderer.invoke('projects:create', projectData);

    expect(result).toMatchObject(projectData);
    expect(result.id).toBeDefined();
    expect(ipcMain.handle).toHaveBeenCalledWith(
      'projects:create',
      expect.any(Function)
    );
  });

  it('deve propagar erros de validação via IPC', async () => {
    const invalidData = {
      name: '', // Invalid name
      ownerId: 'user-123',
    };

    await expect(
      ipcRenderer.invoke('projects:create', invalidData)
    ).rejects.toThrow('Project name must be at least 3 characters');
  });

  it('deve listar projetos via IPC', async () => {
    // Create some test projects first
    await ipcRenderer.invoke('projects:create', {
      name: 'Project 1',
      ownerId: 'user-123',
    });

    await ipcRenderer.invoke('projects:create', {
      name: 'Project 2',
      ownerId: 'user-123',
    });

    // List projects
    const projects = await ipcRenderer.invoke('projects:findByUser', 'user-123');

    expect(projects).toHaveLength(2);
    expect(projects[0].name).toBe('Project 2'); // Most recent first
    expect(projects[1].name).toBe('Project 1');
  });
});
```

---

## 🎭 E2E Tests - 10% dos testes

### Configuração do Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Testando Fluxos Críticos

```typescript
// src/test/e2e/project-creation.test.ts
import { test, expect } from '@playwright/test';

test.describe('Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('[data-testid=username-input]', 'testuser');
    await page.fill('[data-testid=password-input]', 'testpass');
    await page.click('[data-testid=login-button]');
    
    // Wait for dashboard
    await expect(page.locator('[data-testid=dashboard]')).toBeVisible();
  });

  test('deve criar projeto completo via interface', async ({ page }) => {
    // Navigate to create project
    await page.click('[data-testid=new-project-button]');
    
    // Fill project form
    await page.fill('[data-testid=project-name-input]', 'E2E Test Project');
    await page.fill('[data-testid=project-description-input]', 'Created via E2E test');
    await page.fill('[data-testid=project-git-url-input]', 'https://github.com/user/repo.git');
    
    // Submit form
    await page.click('[data-testid=create-project-submit]');
    
    // Wait for project to be created
    await expect(page.locator('[data-testid=project-header]')).toContainText('E2E Test Project');
    
    // Verify we're in the project page
    expect(page.url()).toMatch(/\/project\/[a-zA-Z0-9-]+$/);
    
    // Verify default channels were created
    await expect(page.locator('[data-testid=channel-list]')).toContainText('general');
    await expect(page.locator('[data-testid=channel-list]')).toContainText('announcements');
  });

  test('deve validar dados do formulário', async ({ page }) => {
    await page.click('[data-testid=new-project-button]');
    
    // Try to submit empty form
    await page.click('[data-testid=create-project-submit]');
    
    // Check validation errors
    await expect(page.locator('[data-testid=project-name-error]'))
      .toContainText('Project name is required');
    
    // Fill invalid name (too short)
    await page.fill('[data-testid=project-name-input]', 'ab');
    await page.click('[data-testid=create-project-submit]');
    
    await expect(page.locator('[data-testid=project-name-error]'))
      .toContainText('Project name must be at least 3 characters');
  });

  test('deve cancelar criação de projeto', async ({ page }) => {
    await page.click('[data-testid=new-project-button]');
    await page.fill('[data-testid=project-name-input]', 'Test Project');
    
    // Cancel form
    await page.click('[data-testid=create-project-cancel]');
    
    // Should be back to dashboard
    await expect(page.locator('[data-testid=dashboard]')).toBeVisible();
    
    // Project should not have been created
    await expect(page.locator('[data-testid=project-list]'))
      .not.toContainText('Test Project');
  });
});
```

### Testando Comunicação com Agentes

```typescript
// src/test/e2e/agent-chat.test.ts
import { test, expect } from '@playwright/test';

test.describe('Agent Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test project with agents
    await page.goto('/test-setup');
    await page.evaluate(() => {
      return window.testHelpers.createProjectWithAgents();
    });
    
    await page.goto('/project/test-project/chat/general');
  });

  test('deve enviar mensagem e receber resposta do agente', async ({ page }) => {
    const testMessage = 'Hello, can you help me with this project?';
    
    // Send message
    await page.fill('[data-testid=chat-input]', testMessage);
    await page.press('[data-testid=chat-input]', 'Enter');
    
    // Verify message appears in chat
    await expect(page.locator('[data-testid=message-list]'))
      .toContainText(testMessage);
    
    // Wait for agent response
    await expect(page.locator('[data-testid=message-list] [data-author-type=agent]'))
      .toBeVisible({ timeout: 10000 });
    
    // Verify agent responded
    const agentMessages = page.locator('[data-testid=message-list] [data-author-type=agent]');
    await expect(agentMessages.first()).toContainText(/Hello|Hi|Sure/i);
  });

  test('deve mostrar agente digitando', async ({ page }) => {
    await page.fill('[data-testid=chat-input]', 'Tell me about this project');
    await page.press('[data-testid=chat-input]', 'Enter');
    
    // Should show typing indicator
    await expect(page.locator('[data-testid=typing-indicator]'))
      .toBeVisible({ timeout: 2000 });
    
    // Typing indicator should disappear when message arrives
    await expect(page.locator('[data-testid=typing-indicator]'))
      .not.toBeVisible({ timeout: 10000 });
  });

  test('deve permitir mencionar agente específico', async ({ page }) => {
    const message = '@developer Can you implement a login feature?';
    
    await page.fill('[data-testid=chat-input]', message);
    await page.press('[data-testid=chat-input]', 'Enter');
    
    // Verify mention is highlighted
    await expect(page.locator('[data-testid=message-list] .mention'))
      .toContainText('@developer');
    
    // Developer agent should respond
    await expect(
      page.locator('[data-testid=message-list] [data-agent-name=developer]')
    ).toBeVisible({ timeout: 10000 });
  });
});
```

---

## 📊 Coverage e Quality Gates

### Métricas de Cobertura

```typescript
// vitest.config.mts - Coverage thresholds
coverage: {
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Thresholds específicos por domínio
    'src/main/domains/projects/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/main/domains/agents/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
}
```

### Quality Gates

```bash
#!/bin/bash
# scripts/quality-gates.sh

echo "🔍 Running Quality Gates..."

# 1. Unit tests
echo "📋 Running unit tests..."
npm run test || exit 1

# 2. Coverage check
echo "📊 Checking coverage..."
npm run test:coverage || exit 1

# 3. Integration tests
echo "🔗 Running integration tests..."
npm run test:integration || exit 1

# 4. Type checking
echo "🔧 Type checking..."
npm run type-check || exit 1

# 5. Linting
echo "✨ Linting..."
npm run lint:check || exit 1

# 6. E2E tests (only on CI)
if [ "$CI" = "true" ]; then
  echo "🎭 Running E2E tests..."
  npm run test:e2e || exit 1
fi

echo "✅ All quality gates passed!"
```

---

## 🚀 Test Scripts

### Package.json Scripts

```json
{
  "scripts": {
    // Unit tests
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    
    // Integration tests
    "test:integration": "vitest run --config vitest.integration.config.mts",
    "test:integration:watch": "vitest --config vitest.integration.config.mts",
    
    // E2E tests
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    
    // All tests
    "test:all": "npm run test && npm run test:integration && npm run test:e2e",
    
    // CI pipeline
    "test:ci": "npm run test:coverage && npm run test:integration",
    
    // Test utilities
    "test:clear-cache": "vitest run --clearCache",
    "test:update-snapshots": "vitest run --update-snapshots"
  }
}
```

---

## 🎯 Estratégias por Contexto

### Para Desenvolvedores Juniores

**Foque em:**
1. **Unit tests simples** - Uma função, um comportamento
2. **Happy path primeiro** - Teste o cenário principal
3. **Arrange-Act-Assert** - Estrutura clara dos testes
4. **Nomes descritivos** - "deve fazer X quando Y"

```typescript
// ✅ Teste simples e claro
it('deve retornar true quando usuário tem permissão de admin', () => {
  // Arrange
  const user = { role: 'admin' };
  
  // Act
  const result = hasAdminPermission(user);
  
  // Assert
  expect(result).toBe(true);
});
```

### Para Features Complexas

**Estratégia:**
1. **Unit tests** para cada função/método
2. **Integration test** para o fluxo completo
3. **E2E test** para cenário crítico de usuário

```typescript
// Unit: Teste individual functions
describe('MessageProcessor', () => {
  it('deve extrair menções do texto', () => { ... });
  it('deve validar conteúdo da mensagem', () => { ... });
});

// Integration: Teste fluxo completo
describe('Message Flow', () => {
  it('deve processar mensagem desde input até notificação', () => { ... });
});

// E2E: Teste experiência do usuário
describe('Chat Feature', () => {
  it('usuário deve conseguir enviar mensagem e ver resposta', () => { ... });
});
```

### Para Bug Fixes

**Processo:**
1. **Escreva teste que reproduz o bug** (deve falhar)
2. **Implemente a correção**
3. **Verifique que teste agora passa**
4. **Adicione casos edge** relacionados

```typescript
// Reproduzir bug primeiro
it('deve lidar com mensagem vazia sem crash', () => {
  expect(() => processMessage('')).not.toThrow();
});
```

---

## 🔧 Test Utilities

### Database Test Helpers

```typescript
// src/test/helpers/database.ts
import { db } from '@/infrastructure/database';
import { projects, users, agents } from '@/persistence/schemas';

export async function cleanDatabase() {
  await db.delete(agents);
  await db.delete(projects);
  await db.delete(users);
}

export async function createTestUser(overrides = {}) {
  const defaultUser = {
    id: 'test-user',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    displayName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user = { ...defaultUser, ...overrides };
  
  await db.insert(users).values(user);
  return user;
}

export async function createTestProject(ownerId: string, overrides = {}) {
  const defaultProject = {
    id: 'test-project',
    name: 'Test Project',
    description: 'Test project description',
    ownerId,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const project = { ...defaultProject, ...overrides };
  
  await db.insert(projects).values(project);
  return project;
}
```

### Component Test Helpers

```typescript
// src/test/helpers/render.tsx
import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';

export function renderWithProviders(
  ui: React.ReactElement,
  options = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

### Mock Factories

```typescript
// src/test/factories/project.factory.ts
import { faker } from '@faker-js/faker';

export function createMockProject(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    ownerId: faker.string.uuid(),
    status: 'active' as const,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

export function createMockAgent(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.firstName(),
    role: faker.helpers.arrayElement(['developer', 'designer', 'tester']),
    status: 'online' as const,
    expertise: faker.helpers.arrayElements(['javascript', 'react', 'node.js']),
    ownerId: faker.string.uuid(),
    createdAt: faker.date.past(),
    ...overrides,
  };
}
```

---

## 📈 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
  
  e2e:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎯 Métricas e Monitoramento

### Test Analytics

```typescript
// scripts/test-analytics.ts
import fs from 'fs';
import path from 'path';

interface TestMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

export function generateTestReport(): TestMetrics {
  // Parse test results and coverage data
  const testResults = JSON.parse(
    fs.readFileSync('test-results.json', 'utf8')
  );
  
  const coverageData = JSON.parse(
    fs.readFileSync('coverage/coverage-summary.json', 'utf8')
  );
  
  return {
    totalTests: testResults.numTotalTests,
    passed: testResults.numPassedTests,
    failed: testResults.numFailedTests,
    skipped: testResults.numPendingTests,
    duration: testResults.testResults.reduce((sum, result) => 
      sum + result.perfStats.runtime, 0),
    coverage: {
      lines: coverageData.total.lines.pct,
      functions: coverageData.total.functions.pct,
      branches: coverageData.total.branches.pct,
      statements: coverageData.total.statements.pct,
    },
  };
}
```

---

## 🎯 Próximos Passos

1. **Implementar setup básico** com Vitest
2. **Criar primeiros unit tests** para services principais
3. **Configurar pipeline CI/CD** com testes
4. **Adicionar integration tests** gradualmente
5. **Implementar E2E tests** para fluxos críticos

---

*Esta estratégia de testes foi projetada para ser prática, eficiente e adequada para equipes de todos os níveis, garantindo qualidade sem adicionar complexidade desnecessária.*