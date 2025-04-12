import React from "react";
import { useAuthContext } from "./AuthProvider";

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, fallback = null }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return <div>Carregando...</div>;
  if (!isAuthenticated) return fallback || <div>Acesso restrito. Faça login.</div>;

  return <>{children}</>;
};