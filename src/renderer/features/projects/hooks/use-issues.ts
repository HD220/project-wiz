import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// Types for issues
export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  type: "task" | "bug" | "feature" | "improvement";
  assigneeId?: string;
  assigneeType?: "user" | "agent";
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  labels?: string;
  dueDate?: Date;
  createdBy: string;
  createdByType: "user" | "agent";
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CreateIssueInput {
  projectId: string;
  title: string;
  description?: string;
  status?: "todo" | "in_progress" | "done" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  type?: "task" | "bug" | "feature" | "improvement";
  assigneeId?: string;
  assigneeType?: "user" | "agent";
  estimatedHours?: number;
  storyPoints?: number;
  labels?: string;
  dueDate?: Date;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "done" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  type?: "task" | "bug" | "feature" | "improvement";
  assigneeId?: string;
  assigneeType?: "user" | "agent";
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  labels?: string;
  dueDate?: Date;
}

/**
 * Hook to fetch issues for a project
 */
export function useIssues(projectId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["issues", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const response = await window.api.issues.listByProject(projectId);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch issues");
      }
      return response.data as Issue[];
    },
    enabled: !!projectId,
  });

  return {
    issues: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get issues by status (for Kanban)
 */
export function useIssuesByStatus(projectId?: string) {
  const { issues, isLoading, error, refetch } = useIssues(projectId);

  const issuesByStatus = {
    todo: issues.filter((issue) => issue.status === "todo"),
    in_progress: issues.filter((issue) => issue.status === "in_progress"),
    done: issues.filter((issue) => issue.status === "done"),
    cancelled: issues.filter((issue) => issue.status === "cancelled"),
  };

  return {
    issuesByStatus,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to create an issue
 */
export function useCreateIssue() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const createIssue = async (input: CreateIssueInput) => {
    setIsLoading(true);
    try {
      const response = await window.api.issues.create(input);
      if (!response.success) {
        throw new Error(response.error || "Failed to create issue");
      }

      // Invalidate and refetch issues
      await queryClient.invalidateQueries({
        queryKey: ["issues", input.projectId],
      });

      return response.data as Issue;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createIssue,
    isLoading,
  };
}

/**
 * Hook to update an issue
 */
export function useUpdateIssue() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const updateIssue = async (issueId: string, input: UpdateIssueInput) => {
    setIsLoading(true);
    try {
      const response = await window.api.issues.update(issueId, input);
      if (!response.success) {
        throw new Error(response.error || "Failed to update issue");
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["issues"] });

      return response.data as Issue;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateIssue,
    isLoading,
  };
}

/**
 * Hook to delete an issue
 */
export function useDeleteIssue() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const deleteIssue = async (issueId: string) => {
    setIsLoading(true);
    try {
      const response = await window.api.issues.delete(issueId);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete issue");
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["issues"] });

      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteIssue,
    isLoading,
  };
}

/**
 * Hook to get a single issue by ID
 */
export function useIssue(issueId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["issue", issueId],
    queryFn: async () => {
      if (!issueId) return null;

      const response = await window.api.issues.findById(issueId);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch issue");
      }
      return response.data as Issue;
    },
    enabled: !!issueId,
  });

  return {
    issue: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Task columns for Kanban display
 */
export const taskColumns = [
  {
    id: "todo",
    name: "To Do",
    color: "bg-gray-100",
  },
  {
    id: "in_progress",
    name: "In Progress",
    color: "bg-blue-100",
  },
  {
    id: "done",
    name: "Done",
    color: "bg-green-100",
  },
  {
    id: "cancelled",
    name: "Cancelled",
    color: "bg-red-100",
  },
];

/**
 * Hook to get issues by status for Kanban board
 */
export function useKanbanData(projectId?: string) {
  const { issuesByStatus, isLoading, error, refetch } =
    useIssuesByStatus(projectId);

  const kanbanData = taskColumns.map((column) => ({
    ...column,
    tasks: issuesByStatus[column.id as keyof typeof issuesByStatus] || [],
  }));

  return {
    columns: kanbanData,
    isLoading,
    error,
    refetch,
  };
}
