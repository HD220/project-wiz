// Placeholder data for Project Wiz frontend development
// This file contains mock data to simulate backend responses

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline";
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  unreadCount: number;
  lastActivity: Date;
  gitUrl?: string;
  status: "active" | "inactive" | "archived";
}

export interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  projectId: string;
  unreadCount: number;
  lastMessage?: Message;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  status: "online" | "away" | "busy" | "offline" | "executing";
  type: "assistant" | "code-reviewer" | "project-manager" | "devops" | "custom";
  capabilities: string[];
  currentTask?: string;
  projectId?: string;
  isExecuting: boolean;
  executionProgress?: number;
}

export interface Message {
  id: string;
  content: string;
  type: "text" | "code" | "file" | "system";
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  channelId: string;
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  attachments?: Attachment[];
  mentions?: string[];
  reactions?: Reaction[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "in-review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  projectId: string;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
}

export interface FileTreeItem {
  path: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  lastModified?: Date;
  extension?: string;
  children?: FileTreeItem[];
  expanded?: boolean;
}

export interface TerminalLine {
  id: string;
  content: string;
  type: "command" | "output" | "error";
  timestamp: Date;
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  replies: number;
  views: number;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
}

export interface ForumPost {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  topicId: string;
  createdAt: Date;
  updatedAt: Date;
  edited?: boolean;
  likes: number;
  isAuthorReply: boolean;
}

// Mock data
export const mockUser: User = {
  id: "user-1",
  name: "João Silva",
  email: "joao@example.com",
  avatar: "https://github.com/shadcn.png",
  status: "online",
};

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "E-commerce Platform",
    description: "Sistema de e-commerce com Next.js e Stripe",
    unreadCount: 3,
    lastActivity: new Date("2024-01-15T10:30:00"),
    gitUrl: "https://github.com/user/ecommerce-platform",
    status: "active",
  },
  {
    id: "proj-2",
    name: "Mobile App",
    description: "App React Native para delivery",
    unreadCount: 0,
    lastActivity: new Date("2024-01-14T16:45:00"),
    gitUrl: "https://github.com/user/mobile-delivery",
    status: "active",
  },
  {
    id: "proj-3",
    name: "API Gateway",
    description: "Microserviços com Node.js e Docker",
    unreadCount: 1,
    lastActivity: new Date("2024-01-13T09:15:00"),
    status: "active",
  },
  {
    id: "proj-4",
    name: "Analytics Dashboard",
    description: "Dashboard de analytics com React e D3.js",
    unreadCount: 0,
    lastActivity: new Date("2024-01-10T14:20:00"),
    status: "inactive",
  },
];

export const mockChannels: Channel[] = [
  {
    id: "channel-1",
    name: "geral",
    type: "text",
    projectId: "proj-1",
    unreadCount: 2,
  },
  {
    id: "channel-2",
    name: "desenvolvimento",
    type: "text",
    projectId: "proj-1",
    unreadCount: 1,
  },
  {
    id: "channel-3",
    name: "bugs",
    type: "text",
    projectId: "proj-1",
    unreadCount: 0,
  },
  {
    id: "channel-4",
    name: "deploy",
    type: "text",
    projectId: "proj-1",
    unreadCount: 0,
  },
];

export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Assistente",
    description: "Assistente geral para ajuda e orientação",
    avatar: "🤖",
    status: "online",
    type: "assistant",
    capabilities: ["chat", "help", "planning", "documentation"],
    projectId: "proj-1",
    isExecuting: false,
  },
  {
    id: "agent-2",
    name: "Code Reviewer",
    description: "Especialista em revisão de código e qualidade",
    avatar: "👨‍💻",
    status: "executing",
    type: "code-reviewer",
    capabilities: ["code-review", "testing", "refactoring", "security"],
    currentTask: "Analisando componentes React...",
    projectId: "proj-1",
    isExecuting: true,
    executionProgress: 65,
  },
  {
    id: "agent-3",
    name: "DevOps Engineer",
    description: "Especialista em infraestrutura e deployment",
    avatar: "⚙️",
    status: "away",
    type: "devops",
    capabilities: ["deployment", "monitoring", "docker", "ci-cd"],
    projectId: "proj-1",
    isExecuting: false,
  },
  {
    id: "agent-4",
    name: "Project Manager",
    description: "Gerenciamento de projetos e coordenação de tarefas",
    avatar: "📋",
    status: "online",
    type: "project-manager",
    capabilities: ["planning", "coordination", "reporting", "estimation"],
    projectId: "proj-1",
    isExecuting: false,
  },
  {
    id: "agent-5",
    name: "Frontend Specialist",
    description: "Especialista em desenvolvimento frontend",
    avatar: "🎨",
    status: "busy",
    type: "custom",
    capabilities: ["react", "typescript", "ui-ux", "responsive-design"],
    currentTask: "Criando componentes UI...",
    projectId: "proj-1",
    isExecuting: true,
    executionProgress: 30,
  },
];


export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Implementar autenticação OAuth",
    description: "Adicionar login com Google e GitHub",
    status: "in-progress",
    priority: "high",
    assigneeId: "agent-2",
    assigneeName: "Code Reviewer",
    assigneeAvatar: "👨‍💻",
    projectId: "proj-1",
    labels: ["authentication", "oauth", "security"],
    createdAt: new Date("2024-01-10T09:00:00"),
    updatedAt: new Date("2024-01-15T10:30:00"),
    dueDate: new Date("2024-01-20T17:00:00"),
    estimatedHours: 8,
    actualHours: 5,
  },
  {
    id: "task-2",
    title: "Otimizar performance das consultas",
    description: "Melhorar queries do banco de dados",
    status: "todo",
    priority: "medium",
    assigneeId: "agent-3",
    assigneeName: "DevOps Engineer",
    assigneeAvatar: "⚙️",
    projectId: "proj-1",
    labels: ["database", "performance", "optimization"],
    createdAt: new Date("2024-01-12T14:00:00"),
    updatedAt: new Date("2024-01-12T14:00:00"),
    estimatedHours: 6,
  },
  {
    id: "task-3",
    title: "Criar testes unitários",
    description: "Adicionar testes para componentes principais",
    status: "in-review",
    priority: "medium",
    assigneeId: "agent-2",
    assigneeName: "Code Reviewer",
    assigneeAvatar: "👨‍💻",
    projectId: "proj-1",
    labels: ["testing", "unit-tests", "quality"],
    createdAt: new Date("2024-01-08T11:00:00"),
    updatedAt: new Date("2024-01-14T16:30:00"),
    estimatedHours: 12,
    actualHours: 10,
  },
  {
    id: "task-4",
    title: "Documentar API endpoints",
    description: "Criar documentação Swagger para a API",
    status: "done",
    priority: "low",
    assigneeId: "agent-1",
    assigneeName: "Assistente",
    assigneeAvatar: "🤖",
    projectId: "proj-1",
    labels: ["documentation", "api", "swagger"],
    createdAt: new Date("2024-01-05T10:00:00"),
    updatedAt: new Date("2024-01-12T15:45:00"),
    estimatedHours: 4,
    actualHours: 3,
  },
  {
    id: "task-5",
    title: "Implementar cache Redis",
    description: "Adicionar sistema de cache para melhorar performance",
    status: "todo",
    priority: "high",
    projectId: "proj-1",
    labels: ["cache", "redis", "performance"],
    createdAt: new Date("2024-01-14T13:00:00"),
    updatedAt: new Date("2024-01-14T13:00:00"),
    estimatedHours: 8,
  },
  {
    id: "task-6",
    title: "Design system components",
    description: "Criar biblioteca de componentes reutilizáveis",
    status: "in-progress",
    priority: "medium",
    assigneeId: "agent-5",
    assigneeName: "Frontend Specialist",
    assigneeAvatar: "🎨",
    projectId: "proj-1",
    labels: ["design-system", "components", "ui"],
    createdAt: new Date("2024-01-11T08:00:00"),
    updatedAt: new Date("2024-01-15T09:15:00"),
    estimatedHours: 16,
    actualHours: 8,
  },
];

export const mockFileTree: FileTreeItem[] = [
  {
    path: "/src",
    name: "src",
    type: "folder",
    expanded: true,
    children: [
      {
        path: "/src/components",
        name: "components",
        type: "folder",
        expanded: true,
        children: [
          {
            path: "/src/components/ui",
            name: "ui",
            type: "folder",
            children: [
              {
                path: "/src/components/ui/button.tsx",
                name: "button.tsx",
                type: "file",
                extension: "tsx",
                size: 2048,
                lastModified: new Date("2024-01-15T10:30:00"),
              },
              {
                path: "/src/components/ui/input.tsx",
                name: "input.tsx",
                type: "file",
                extension: "tsx",
                size: 1536,
                lastModified: new Date("2024-01-14T16:45:00"),
              },
            ],
          },
          {
            path: "/src/components/layout",
            name: "layout",
            type: "folder",
            children: [
              {
                path: "/src/components/layout/header.tsx",
                name: "header.tsx",
                type: "file",
                extension: "tsx",
                size: 3072,
                lastModified: new Date("2024-01-13T09:15:00"),
              },
            ],
          },
        ],
      },
      {
        path: "/src/pages",
        name: "pages",
        type: "folder",
        children: [
          {
            path: "/src/pages/home.tsx",
            name: "home.tsx",
            type: "file",
            extension: "tsx",
            size: 4096,
            lastModified: new Date("2024-01-12T14:20:00"),
          },
          {
            path: "/src/pages/dashboard.tsx",
            name: "dashboard.tsx",
            type: "file",
            extension: "tsx",
            size: 5120,
            lastModified: new Date("2024-01-15T11:00:00"),
          },
        ],
      },
      {
        path: "/src/lib",
        name: "lib",
        type: "folder",
        children: [
          {
            path: "/src/lib/utils.ts",
            name: "utils.ts",
            type: "file",
            extension: "ts",
            size: 1024,
            lastModified: new Date("2024-01-10T08:30:00"),
          },
        ],
      },
    ],
  },
  {
    path: "/public",
    name: "public",
    type: "folder",
    children: [
      {
        path: "/public/images",
        name: "images",
        type: "folder",
        children: [
          {
            path: "/public/images/logo.png",
            name: "logo.png",
            type: "file",
            extension: "png",
            size: 8192,
            lastModified: new Date("2024-01-01T12:00:00"),
          },
        ],
      },
    ],
  },
  {
    path: "/package.json",
    name: "package.json",
    type: "file",
    extension: "json",
    size: 2048,
    lastModified: new Date("2024-01-15T09:00:00"),
  },
  {
    path: "/README.md",
    name: "README.md",
    type: "file",
    extension: "md",
    size: 4096,
    lastModified: new Date("2024-01-14T18:30:00"),
  },
];

export const mockTerminalLines: TerminalLine[] = [
  {
    id: "term-1",
    content: "npm install",
    type: "command",
    timestamp: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "term-2",
    content: "added 1247 packages, and audited 1248 packages in 45s",
    type: "output",
    timestamp: new Date("2024-01-15T10:30:45"),
  },
  {
    id: "term-3",
    content: "found 0 vulnerabilities",
    type: "output",
    timestamp: new Date("2024-01-15T10:30:46"),
  },
  {
    id: "term-4",
    content: "npm run dev",
    type: "command",
    timestamp: new Date("2024-01-15T10:32:00"),
  },
  {
    id: "term-5",
    content: "> next dev",
    type: "output",
    timestamp: new Date("2024-01-15T10:32:01"),
  },
  {
    id: "term-6",
    content: "- ready started server on 0.0.0.0:3000",
    type: "output",
    timestamp: new Date("2024-01-15T10:32:03"),
  },
  {
    id: "term-7",
    content: "git status",
    type: "command",
    timestamp: new Date("2024-01-15T10:35:00"),
  },
  {
    id: "term-8",
    content:
      "On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  modified:   src/components/ui/button.tsx\n  modified:   src/pages/dashboard.tsx",
    type: "output",
    timestamp: new Date("2024-01-15T10:35:01"),
  },
];

export const mockForumTopics: ForumTopic[] = [
  {
    id: "topic-1",
    title: "Como configurar o ambiente de desenvolvimento?",
    content:
      "Estou tendo dificuldades para configurar o ambiente local. Alguém pode me ajudar com o setup inicial?",
    authorId: "user-1",
    authorName: "João Silva",
    authorAvatar: "https://github.com/shadcn.png",
    createdAt: new Date("2024-01-14T09:00:00"),
    updatedAt: new Date("2024-01-15T10:30:00"),
    replies: 5,
    views: 23,
    tags: ["setup", "desenvolvimento", "ambiente"],
    isPinned: true,
    isLocked: false,
  },
  {
    id: "topic-2",
    title: "Dúvidas sobre integração com APIs externas",
    content:
      "Quais são as melhores práticas para integrar com APIs de terceiros? Estou pensando em cache, rate limiting, etc.",
    authorId: "user-2",
    authorName: "Maria Santos",
    createdAt: new Date("2024-01-13T15:30:00"),
    updatedAt: new Date("2024-01-14T18:45:00"),
    replies: 12,
    views: 67,
    tags: ["api", "integração", "boas-práticas"],
    isPinned: false,
    isLocked: false,
  },
  {
    id: "topic-3",
    title: "Estratégias de testes automatizados",
    content:
      "Como vocês estruturam os testes? Unit tests, integration tests, e2e? Quais ferramentas recomendam?",
    authorId: "user-3",
    authorName: "Pedro Costa",
    createdAt: new Date("2024-01-12T11:15:00"),
    updatedAt: new Date("2024-01-13T09:20:00"),
    replies: 8,
    views: 45,
    tags: ["testes", "automação", "qualidade"],
    isPinned: false,
    isLocked: false,
  },
];

// Task columns for Kanban board
export const taskColumns = [
  { id: "todo", name: "A Fazer", color: "bg-gray-500" },
  { id: "in-progress", name: "Em Progresso", color: "bg-blue-500" },
  { id: "in-review", name: "Em Revisão", color: "bg-yellow-500" },
  { id: "done", name: "Concluído", color: "bg-green-500" },
];

// Helper functions
export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find((project) => project.id === id);
};

export const getAgentById = (id: string): Agent | undefined => {
  return mockAgents.find((agent) => agent.id === id);
};

export const getTasksByStatus = (status: string): Task[] => {
  return mockTasks.filter((task) => task.status === status);
};


export const getAgentsByProject = (projectId: string): Agent[] => {
  return mockAgents.filter((agent) => agent.projectId === projectId);
};

export const getChannelsByProject = (projectId: string): Channel[] => {
  return mockChannels.filter((channel) => channel.projectId === projectId);
};
