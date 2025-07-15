import { Project } from "./types";

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

export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(project => project.id === id);
};