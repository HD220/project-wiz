import { useState, useEffect } from "react";

import type { Member } from "@/renderer/components/members/member-sidebar";
import type { UserSummary } from "@/renderer/features/conversation/hooks/use-user-selection.hook";
import { loadApiData } from "@/renderer/lib/route-loader";

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const users = await loadApiData(
          () => window.api.user.listAvailableUsers({}),
          "Failed to load users",
        );

        const combinedMembers: Member[] = [];

        // Add all users (both humans and agents)
        users.forEach((user: UserSummary) => {
          combinedMembers.push({
            id: user.id,
            name: user.name,
            username: user.name.toLowerCase().replace(/\s+/g, ""),
            status: user.status || "offline", // Use actual user status
            role: "member",
            avatarUrl: user.avatar || undefined,
            type: user.type, // Will be "user" or "agent"
          });
        });

        // Note: agents are now included in users query above since agents ARE users

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
