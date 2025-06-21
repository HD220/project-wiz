import type { ProjectStatus, TaskStatus, UserAvailabilityStatus } from "@/types/domain";
import type { ProjectType } from "@/types/project";
export const initialMessages = [];
export const userGuideContent = `
# GFM Guide

Este é um exemplo de conteúdo para o guia do usuário, utilizando GitHub Flavored Markdown.

## Autolink literals

Links são detectados automaticamente: www.example.com, https://example.com, e contact@example.com.

## Notas de Rodapé

Aqui está uma simples nota de rodapé,[^1] e aqui uma mais longa.[^bignote]

[^1]: Esta é a primeira nota de rodapé.
[^bignote]: Aqui está uma nota de rodapé com múltiplos blocos e parágrafos.

    Indentada com espaços para continuar o parágrafo da nota de rodapé.

    Adicione quantos parágrafos desejar.

## Strikethrough (Riscado)

Use um ou dois tils para riscar texto: ~um til~ ou ~~dois tils~~.

## Tabelas

Você pode criar tabelas alinhando colunas.

| Cabeçalho 1 | Cabeçalho 2 | Cabeçalho 3 |
| :---------- | :---------: | ----------: |
| Conteúdo    |   Central   |    À Direita |
| Item A      |   Item B    |      Item C |

- A linha externa de pipes (|) é opcional.
- As três ou mais hífens (---) separam cada célula do cabeçalho.
- Coloque dois pontos (:) conforme mostrado para alinhar colunas.

## Listas de Tarefas (Task Lists)

* [x] Tarefa concluída
* [ ] Tarefa pendente
* [ ] Adicionar mais exemplos de Markdown
  * [ ] Sub-item pendente
  * [x] Sub-item concluído

## Blocos de Código

Você pode usar acentos graves para blocos de código.

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet("Usuário");
\`\`\`

## Citações (Blockquotes)

> Este é um bloco de citação.
> Você pode adicionar múltiplas linhas.
> > Citações aninhadas também são possíveis!

## Texto em Negrito e Itálico

**Este texto está em negrito.**
*Este texto está em itálico.*
***Este texto está em negrito e itálico.***

## Links e Imagens

[Link para o Google](https://www.google.com)

![Texto alternativo da imagem](https://via.placeholder.com/150/0000FF/808080?Text=Imagem+Exemplo "Título da Imagem")

---

Fim do guia de exemplo.
`;
// Add more placeholders as needed by the plan

// Type for a single persona (copied to persona-list.tsx as well for now)
export type PersonaPlaceholder = {
  id: string;
  name: string;
  description: string;
  avatar: string;
  gender: "masculino" | "feminino";
  color: string;
};

export const personasPlaceholder: PersonaPlaceholder[] = [
  // Personas masculinas
  {
    id: "carlos",
    name: "Carlos",
    description:
      "Analítico e objetivo, sempre focado em fornecer informações precisas e diretas.",
    avatar:
      "https://api.dicebear.com/9.x/bottts/svg?seed=male1&backgroundColor=b6e3f4&radius=50",
    gender: "masculino",
    color: "blue",
  },
  {
    id: "pedro",
    name: "Pedro",
    description:
      "Amigável e paciente, explica conceitos complexos de forma simples e acessível.",
    avatar:
      "https://api.dicebear.com/9.x/bottts/svg?seed=male2&backgroundColor=c0aede&radius=50",
    gender: "masculino",
    color: "green",
  },
  {
    id: "rafael",
    name: "Rafael",
    description:
      "Criativo e inspirador, ajuda a pensar fora da caixa e encontrar soluções inovadoras.",
    avatar:
      "https://api.dicebear.com/9.x/bottts/svg?seed=male3&backgroundColor=d1d4f9&radius=50",
    gender: "masculino",
    color: "amber",
  },
  // Personas femininas
  {
    id: "ana",
    name: "Ana",
    description:
      "Metódica e detalhista, oferece explicações completas com exemplos práticos.",
    avatar:
      "https://api.dicebear.com/9.x/bottts/svg?seed=female1&backgroundColor=ffdfbf&radius=50&gender=female",
    gender: "feminino",
    color: "purple",
  },
  {
    id: "julia",
    name: "Julia",
    description:
      "Empática e colaborativa, foca em entender suas necessidades e oferecer suporte personalizado.",
    avatar:
      "https://api.dicebear.com/9.x/bottts/svg?seed=female2&backgroundColor=ffd5dc&radius=50&gender=female",
    gender: "feminino",
    color: "pink",
  },
  {
    id: "mariana",
    name: "Mariana",
    description:
      "Entusiasta e motivadora, incentiva a exploração de novas ideias e abordagens.",
    avatar:
      "https://api.dicebear.com/9.x/bottts/svg?seed=female3&backgroundColor=c0e8d5&radius=50&gender=female",
    gender: "feminino",
    color: "rose",
  },
];

// LLM Configuration Placeholders
export type LLMModelPlaceholder = {
  id: string; // Changed from string | number to just string for consistency
  name: string;
  slug: string;
};

export type LLMProviderPlaceholder = {
  id: string; // Changed from string | number to just string
  name: string;
  slug: string;
  models: LLMModelPlaceholder[];
};

export const llmProvidersPlaceholder: LLMProviderPlaceholder[] = [
  {
    id: "provider-1-uuid", // Using mock UUIDs
    name: "OpenAI",
    slug: "openai",
    models: [
      { id: "gpt-4-uuid", name: "GPT-4", slug: "gpt-4" },
      { id: "gpt-3.5-turbo-uuid", name: "GPT-3.5 Turbo", slug: "gpt-3.5-turbo" },
    ],
  },
  {
    id: "provider-2-uuid",
    name: "Google Gemini",
    slug: "gemini",
    models: [
      { id: "gemini-pro-uuid", name: "Gemini Pro", slug: "gemini-pro" },
      { id: "gemini-ultra-uuid", name: "Gemini Ultra", slug: "gemini-ultra" },
    ],
  },
  {
    id: "provider-3-uuid",
    name: "Anthropic",
    slug: "anthropic",
    models: [
      { id: "claude-2-uuid", name: "Claude 2", slug: "claude-2"},
      { id: "claude-instant-uuid", name: "Claude Instant", slug: "claude-instant"},
    ]
  }
];

// User Dashboard Placeholders
// Replaced by ProjectType
export type PlaceholderProject = ProjectType;
/* Original PlaceholderProject structure was:
export type PlaceholderProject = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  lastUpdate: string;
};
*/

export type PlaceholderActivity = {
  id: string;
  i18nKey: string; // Lingui message ID
  values?: Record<string, string | number>; // Values for interpolation
  defaultText?: string; // Default text for the message ID
  timestamp: string; // ISO date string
};

export const placeholderUserProjects: PlaceholderProject[] = [
  { id: "proj-1", name: "Refatoração do Frontend", description: "Melhorar a estrutura e componentes do frontend.", status: "Em Andamento", lastUpdate: "2024-07-28T10:00:00Z" },
  { id: "proj-2", name: "Novo Módulo de IA", description: "Desenvolver um novo módulo de inteligência artificial para análise de dados.", status: "Em Andamento", lastUpdate: "2024-07-27T15:30:00Z" },
  { id: "proj-3", name: "Documentação API v2", description: "Escrever a documentação completa para a nova versão da API.", status: "Concluído", lastUpdate: "2024-07-25T09:00:00Z" },
];

export const placeholderUserActivity: PlaceholderActivity[] = [
  { id: "act-1", i18nKey: "activity.projectStatusUpdated", values: { projectName: "Refatoração do Frontend" }, defaultText: "Você atualizou o status do projeto \"{projectName}\"." , timestamp: "2024-07-28T10:05:00Z" },
  { id: "act-2", i18nKey: "activity.newCommit", values: { commitMessage: "feat: add user dashboard skeleton", projectName: "Project Wiz" }, defaultText: "Novo commit \"{commitMessage}\" no projeto \"{projectName}\"." , timestamp: "2024-07-28T09:30:00Z" },
  { id: "act-3", i18nKey: "activity.taskCompleted", values: { taskName: "Criar layout básico", projectName: "Refatoração do Frontend" }, defaultText: "Tarefa \"{taskName}\" marcada como concluída no projeto \"{projectName}\"." , timestamp: "2024-07-27T18:00:00Z" },
];

// Project Detail Placeholders
export type PlaceholderTask = {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo: string;
  priority: "Alta" | "Média" | "Baixa";
};

export type PlaceholderTeamMember = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export const placeholderProjectDetails: Record<string, { tasks: PlaceholderTask[]; teamMembers: PlaceholderTeamMember[] }> = {
  "proj-1": {
    tasks: [
      { id: "task-1-1", title: "Configurar estrutura de componentes", status: "Concluída", assignedTo: "Ana Silva", priority: "Alta" },
      { id: "task-1-2", title: "Criar UserDashboard component", status: "Em Andamento", assignedTo: "Carlos Oliveira", priority: "Alta" },
      { id: "task-1-3", title: "Implementar página de lista de projetos", status: "Pendente", assignedTo: "Ana Silva", priority: "Média" },
    ],
    teamMembers: [
      { id: "user-ana", name: "Ana Silva", role: "Desenvolvedora Frontend", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
      { id: "user-carlos", name: "Carlos Oliveira", role: "Desenvolvedor Frontend", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" },
      { id: "user-bia", name: "Beatriz Lima", role: "UX Designer", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bia" },
    ],
  },
  "proj-2": {
    tasks: [
      { id: "task-2-1", title: "Pesquisar algoritmos de IA", status: "Concluída", assignedTo: "Pedro Santos", priority: "Alta" },
      { id: "task-2-2", title: "Desenvolver PoC do módulo de IA", status: "Em Andamento", assignedTo: "Mariana Costa", priority: "Alta" },
    ],
    teamMembers: [
      { id: "user-pedro", name: "Pedro Santos", role: "Engenheiro de IA", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" },
      { id: "user-mariana", name: "Mariana Costa", role: "Cientista de Dados", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana" },
    ],
  },
  "proj-3": {
    tasks: [
        { id: "task-3-1", title: "Definir endpoints da API", status: "Concluída", assignedTo: "Julia Alves", priority: "Alta" },
        { id: "task-3-2", title: "Escrever exemplos de uso", status: "Concluída", assignedTo: "Rafael Moreira", priority: "Média" },
    ],
    teamMembers: [
        { id: "user-julia", name: "Julia Alves", role: "Desenvolvedora Backend", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julia" },
        { id: "user-rafael", name: "Rafael Moreira", role: "Escritor Técnico", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rafael" },
    ]
  }
};

// Function to get details for a project, or default if not found
export function getProjectDetailsPlaceholder(projectId: string): { tasks: PlaceholderTask[]; teamMembers: PlaceholderTeamMember[] } {
  return placeholderProjectDetails[projectId] || { tasks: [], teamMembers: [] };
}

// Direct Message Placeholders
// Assuming ChatMessageProps is defined in "@/components/chat/chat-message"
// and has at least: id, autor, conteudo, timestamp.
// For clarity, we can define a similar type here or ensure data matches.
export type PlaceholderChatMessage = {
  id: string;
  autor: string;
  conteudo: string;
  timestamp: string;
  // avatar?: string; // Add if used by ChatMessage component
  // status?: "enviada" | "entregue" | "lida"; // Add if used
};

export const placeholderDirectMessages: PlaceholderChatMessage[] = [
  {
    id: "dm-m1",
    autor: "Ana Silva",
    conteudo: "Olá, Carlos! Tudo bem com o projeto X?",
    timestamp: "Ontem às 14:30",
  },
  {
    id: "dm-m2",
    autor: "Carlos Oliveira",
    conteudo: "Oi Ana! Tudo indo bem, quase finalizando a task Y.",
    timestamp: "Ontem às 14:32",
  },
  {
    id: "dm-m3",
    autor: "Ana Silva",
    conteudo: "Ótimo! Me avise se precisar de ajuda.",
    timestamp: "Ontem às 14:35",
  },
  {
    id: "dm-m4",
    autor: "Carlos Oliveira",
    conteudo: "Combinado, obrigado! 👍",
    timestamp: "Ontem às 14:36",
  },
  // Adding more messages to make the chat thread longer for testing UI
  {
    id: "dm-m5",
    autor: "Ana Silva",
    conteudo: "Você viu o último email sobre o cronograma?",
    timestamp: "Hoje às 09:15",
  },
  {
    id: "dm-m6",
    autor: "Carlos Oliveira",
    conteudo: "Vi sim, parece que teremos que acelerar algumas entregas.",
    timestamp: "Hoje às 09:18",
  },
  {
    id: "dm-m7",
    autor: "Ana Silva",
    conteudo: "Exato. Vou focar na documentação hoje.",
    timestamp: "Hoje às 09:20",
  },
  {
    id: "dm-m8",
    autor: "Carlos Oliveira",
    conteudo: "Perfeito. Eu pego os testes unitários então.",
    timestamp: "Hoje às 09:22",
  },
  {
    id: "dm-m9",
    autor: "Carlos Oliveira",
    conteudo: "Aproveitando, qual a sua opinião sobre a nova biblioteca de UI que sugeriram?",
    timestamp: "Hoje às 10:05",
  },
  {
    id: "dm-m10",
    autor: "Ana Silva",
    conteudo: "Parece promissora, mas precisamos avaliar a curva de aprendizado e a compatibilidade com o sistema legado.",
    timestamp: "Hoje às 10:10",
  },
  {
    id: "dm-m11",
    autor: "Carlos Oliveira",
    conteudo: "Concordo. Podemos marcar uma reunião rápida para discutir isso amanhã?",
    timestamp: "Hoje às 10:12",
  },
  {
    id: "dm-m12",
    autor: "Ana Silva",
    conteudo: "Claro, pode ser às 10h?",
    timestamp: "Hoje às 10:15",
  }
];

// AppSidebar Project Placeholders
export type AppSidebarProjectPlaceholder = {
  id: string;
  name: string;
  tooltip?: string;
};

export const placeholderAppSidebarProjects: AppSidebarProjectPlaceholder[] = [
  { id: "proj-appsb-1", name: "Projeto 1" },
  { id: "proj-appsb-2", name: "Projeto 2" },
  { id: "proj-appsb-3", name: "Projeto 3" },
  { id: "proj-appsb-4", name: "Projeto 4" },
  { id: "proj-appsb-5", name: "Projeto 5" },
  { id: "proj-appsb-6", name: "Projeto 6" },
  { id: "proj-appsb-7", name: "Projeto 7" },
  { id: "proj-appsb-8", name: "Projeto 8" },
  { id: "proj-appsb-9", name: "Projeto 9" },
  { id: "proj-appsb-10", name: "Projeto 10" },
  { id: "proj-appsb-11", name: "Projeto 11" },
  { id: "proj-appsb-12", name: "Projeto 12" },
  { id: "proj-appsb-13", name: "Projeto 13" },
];

// ProjectSidebar Placeholders
// import { Home, Inbox, Calendar, Search, Settings, LucideIcon } from "lucide-react"; // This line is commented out as imports are not allowed in placeholder data files. The mapping will be in the component.

export type ProjectNavItemPlaceholder = {
  title: string;
  url: string;
  iconName: "Home" | "Inbox" | "Calendar" | "Search" | "Settings"; // Store names
};

export const placeholderProjectNavItems: ProjectNavItemPlaceholder[] = [
  { title: "Dashboard", url: "/user", iconName: "Home" }, // Assuming /user is a generic dashboard link for now
  { title: "Tarefas", url: "#", iconName: "Inbox" },
  { title: "Forum", url: "/user/user-guides", iconName: "Calendar" }, // Assuming a generic forum link
  { title: "Documentação", url: "#", iconName: "Search" },
  { title: "Analytics", url: "#", iconName: "Settings" },
  { title: "Configurações", url: "#", iconName: "Settings" },
];

export type ProjectChannelPlaceholder = {
  id: string;
  name: string;
  category: string;
};

export const placeholderProjectChannels: ProjectChannelPlaceholder[] = [
  { id: "ch-1", name: "canal 1", category: "categoria 1" },
  { id: "ch-2", name: "canal 2", category: "categoria 1" },
  { id: "ch-3", name: "canal 3", category: "categoria 1" },
  { id: "ch-4", name: "canal 4", category: "categoria 2" },
  { id: "ch-5", name: "canal 5", category: "categoria 2" },
  { id: "ch-6", name: "canal 6", category: "categoria 2" },
  { id: "ch-7", name: "canal 7", category: "categoria 3" },
];

// Helper to map icon names to actual components (can be defined in ProjectSidebar or here)
// For now, will implement mapping within ProjectSidebar to keep placeholders pure.

// UserSidebar Placeholders
// Assuming icon names will be mapped like in ProjectSidebar
export type UserSidebarNavItemPlaceholder = {
  title: string;
  url: string;
  iconName: "Home" | "Inbox" | "Calendar" | "Search" | "Settings"; // Add more if needed
};

export const placeholderUserSidebarNavItems: UserSidebarNavItemPlaceholder[] = [
  { title: "Dashboard", url: "/user", iconName: "Home" },
  { title: "Integrações", url: "#", iconName: "Inbox" },
  { title: "Guias de Uso", url: "/user/user-guides", iconName: "Calendar" },
  { title: "MCPs", url: "#", iconName: "Search" },
  { title: "Personas/Agents", url: "#", iconName: "Settings" },
  { title: "Configurações", url: "#", iconName: "Settings" },
];

export type UserPlaceholder = {
  id: string;
  name: string;
  status: UserAvailabilityStatus;
  avatar: string; // URL to avatar image
};

export const placeholderUserListForDM: UserPlaceholder[] = [
  { id: "user-nicolas", name: "Nicolas", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nicolas", status: "available" },
  { id: "user-julio", name: "Júlio Scremin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julio", status: "available" },
  { id: "user-renos1", name: "Renos1", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Renos1", status: "available" },
  // Added from previous placeholderProjectDetails for consistency if needed
  { id: "user-ana", name: "Ana Silva", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana", status: "available" },
  { id: "user-carlos", name: "Carlos Oliveira", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos", status: "available" },
];

export type IndividualDMPlaceholder = {
  type: "individual";
  id: string; // DM thread ID
  userId: string; // ID of the other user
};

export type GroupDMPlaceholder = {
  type: "group";
  id: string; // DM thread ID
  description: string; // Group name
  participants: { userId: string }[];
};

export type DirectMessageThreadPlaceholder = IndividualDMPlaceholder | GroupDMPlaceholder;

export const placeholderDirectMessageThreads: DirectMessageThreadPlaceholder[] = [
  { type: "individual", id: "dm-julio", userId: "user-julio" },
  { type: "individual", id: "dm-renos1", userId: "user-renos1" },
  { type: "group", id: "dm-group-apoio", description: "Apoio Mateus", participants: [{ userId: "user-nicolas" }, { userId: "user-julio" }, { userId: "user-renos1" }] },
  { type: "individual", id: "dm-ana", userId: "user-ana" },
];
