import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { TerminalCommand } from "@/shared/types/projects/terminal.types";

import { terminalService } from "../services/terminal.service";

export function useTerminalSessions(projectId: string) {
  return useQuery({
    queryKey: ["terminal", "sessions", projectId],
    queryFn: () => terminalService.getProjectSessions(projectId),
    enabled: !!projectId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

export function useTerminalSession(sessionId: string) {
  return useQuery({
    queryKey: ["terminal", "session", sessionId],
    queryFn: () => terminalService.getSession(sessionId),
    enabled: !!sessionId,
    refetchInterval: 1000, // Refetch every second for real-time updates
  });
}

export function useDefaultTerminalSessions() {
  return useQuery({
    queryKey: ["terminal", "defaultSessions"],
    queryFn: () => terminalService.getDefaultSessions(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateTerminalSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      name,
      directory,
    }: {
      projectId: string;
      name: string;
      directory?: string;
    }) => terminalService.createSession(projectId, name, directory),
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({
        queryKey: ["terminal", "sessions", newSession.projectId],
      });
      queryClient.setQueryData(
        ["terminal", "session", newSession.id],
        newSession,
      );
    },
  });
}

export function useExecuteCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      command,
    }: {
      sessionId: string;
      command: TerminalCommand;
    }) => terminalService.executeCommand(sessionId, command),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["terminal", "session", response.sessionId],
      });
    },
  });
}

export function useClearTerminalSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => terminalService.clearSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: ["terminal", "session", sessionId],
      });
    },
  });
}

export function useCloseTerminalSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => terminalService.closeSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: ["terminal", "session", sessionId],
      });
    },
  });
}
