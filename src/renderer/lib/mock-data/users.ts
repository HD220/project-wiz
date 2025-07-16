import { User } from "./types";

export const mockUser: User = {
  id: "user-1",
  name: "João Silva",
  email: "joao@example.com",
  avatar: "/avatars/user-1.jpg",
  status: "online",
};

export const mockUsers: User[] = [
  mockUser,
  {
    id: "user-2",
    name: "Maria Santos",
    email: "maria@example.com",
    avatar: "/avatars/user-2.jpg",
    status: "away",
  },
  {
    id: "user-3",
    name: "Pedro Costa",
    email: "pedro@example.com",
    status: "offline",
  },
];

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};
