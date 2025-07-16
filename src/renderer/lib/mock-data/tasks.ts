import type { Task } from "./types";

export const taskColumns = [
  {
    id: "todo",
    name: "To Do",
    color: "bg-gray-100",
  },
  {
    id: "in-progress",
    name: "In Progress",
    color: "bg-blue-100",
  },
  {
    id: "review",
    name: "Review",
    color: "bg-yellow-100",
  },
  {
    id: "done",
    name: "Done",
    color: "bg-green-100",
  },
];

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Implement user authentication",
    description: "Add login and registration functionality",
    status: "in-progress",
    priority: "high",
    assignedTo: "user-1",
    assignedToName: "John Doe",
    assignedToAvatar: "👨‍💻",
    projectId: "proj-1",
    createdAt: new Date("2024-01-15"),
    dueDate: new Date("2024-01-30"),
    labels: ["authentication", "security"],
    estimatedHours: 8,
    actualHours: 4,
  },
  {
    id: "task-2",
    title: "Design landing page",
    description: "Create wireframes and mockups for the landing page",
    status: "todo",
    priority: "medium",
    assignedTo: "user-2",
    assignedToName: "Jane Smith",
    assignedToAvatar: "👩‍🎨",
    projectId: "proj-1",
    createdAt: new Date("2024-01-16"),
    dueDate: new Date("2024-02-01"),
    labels: ["design", "ui-ux"],
    estimatedHours: 12,
  },
  {
    id: "task-3",
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment",
    status: "review",
    priority: "high",
    assignedTo: "user-3",
    assignedToName: "Bob Johnson",
    assignedToAvatar: "👨‍🔧",
    projectId: "proj-1",
    createdAt: new Date("2024-01-14"),
    dueDate: new Date("2024-01-25"),
    labels: ["devops", "automation"],
    estimatedHours: 6,
    actualHours: 5,
  },
  {
    id: "task-4",
    title: "Write documentation",
    description: "Create user guide and API documentation",
    status: "done",
    priority: "low",
    assignedTo: "user-4",
    assignedToName: "Alice Wilson",
    assignedToAvatar: "📝",
    projectId: "proj-1",
    createdAt: new Date("2024-01-10"),
    dueDate: new Date("2024-01-20"),
    labels: ["documentation"],
    estimatedHours: 4,
    actualHours: 3,
  },
];

export const getTasksByStatus = (status: Task["status"]) => {
  return mockTasks.filter((task) => task.status === status);
};

export const getTaskById = (id: string) => {
  return mockTasks.find((task) => task.id === id);
};

export const getTasksByProject = (projectId: string) => {
  return mockTasks.filter((task) => task.projectId === projectId);
};
