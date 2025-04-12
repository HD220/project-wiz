import React from "react";
import { useAuthContext } from "./auth-provider";

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, fallback = null }) => {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return fallback || <div>Restricted access. Please sign in.</div>;

  return <>{children}</>;
};