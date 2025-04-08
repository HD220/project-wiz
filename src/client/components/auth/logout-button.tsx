import React from "react";
import { useAuth } from "../../hooks/use-auth";

const LogoutButton: React.FC = () => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      console.error("Erro ao fazer logout:", err.message);
    }
  };

  return (
    <button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Saindo..." : "Logout"}
    </button>
  );
};

export default LogoutButton;
