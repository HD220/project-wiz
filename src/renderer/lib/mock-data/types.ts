// Shared types for mock data

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
  timestamp: Date;
  channelId?: string;
  isRead: boolean;
  reactions?: MessageReaction[];
  attachments?: FileAttachment[];
}

export interface MessageReaction {
  emoji: string;
  users: User[];
  count: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  assignedToName?: string;
  assignedToAvatar?: string;
  projectId: string;
  createdAt: Date;
  dueDate?: Date;
  labels: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface FileTreeItem {
  id: string;
  name: string;
  type: "file" | "directory";
  parentId?: string;
  path: string;
  size?: number;
  modified?: Date;
  children?: FileTreeItem[];
}

export interface TerminalLine {
  id: string;
  content: string;
  type: "input" | "output" | "error";
  timestamp: Date;
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author: User;
  replies: ForumReply[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  views: number;
  upvotes: number;
  downvotes: number;
}

export interface ForumReply {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  upvotes: number;
  downvotes: number;
}
