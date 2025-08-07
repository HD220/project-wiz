import { useState, useEffect } from "react";

import type { Member } from "@/renderer/components/members/member-sidebar";
import type { UserSummary } from "@/renderer/features/user/hooks/use-user-selection.hook";
import { loadApiData } from "@/renderer/lib/route-loader";

import type { Agent } from "@/shared/types";

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const [users, agents] = await Promise.all([
          loadApiData(
            () => window.api.user.listAvailableUsers({ projectId }),
            "Failed to load users",
          ),
          loadApiData(
            () => window.api.agent.list({ projectId }),
            "Failed to load agents",
          ),
        ]);

        const combinedMembers: Member[] = [];

        // Add users
        users.forEach((user: UserSummary) => {
          combinedMembers.push({
            id: user.id,
            name: user.name,
            username: user.name.toLowerCase().replace(/\s+/g, ""),
            status: "online", // Default status for users
            role: "member",
            avatarUrl: user.avatar || undefined,
            type: "user",
          });
        });

        // Add agents
        agents.forEach((agent: Agent) => {
          combinedMembers.push({
            id: agent.id,
            name: agent.name,
            username: agent.name.toLowerCase().replace(/\s+/g, ""),
            status: agent.status === "active" ? "online" : "offline", // Map agent status
            role: "member",
            avatarUrl: agent.avatar || undefined,
            type: "agent",
          });
        });

        setMembers(combinedMembers);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  return { members, loading, error };
}
