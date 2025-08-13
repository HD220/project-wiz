import { useState, useMemo } from "react";
// Define UserSummary type locally
export interface UserSummary {
  id: string;
  name: string;
  avatar: string | null;
  type: "human" | "agent";
  status: "online" | "away" | "busy" | "offline";
}

export function useUserSelection(initialUsers: UserSummary[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user: UserSummary) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [initialUsers, searchTerm]);

  const handleSearchChange = (value: string) => {
    if (value.length <= 100) {
      setSearchTerm(value);
      setError(null);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
    setError(null);
  };

  const validateSelection = () => {
    if (selectedUserIds.length === 0) {
      setError("Please select at least one user to start a conversation");
      return false;
    }
    if (searchTerm.trim().length > 100) {
      setError("Search term is too long");
      return false;
    }
    setError(null);
    return true;
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedUserIds,
    setSelectedUserIds,
    error,
    setError,
    filteredUsers,
    handleSearchChange,
    handleUserToggle,
    validateSelection,
    selectedCount: selectedUserIds.length,
  };
}
