import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/_authenticated");

export function useUser() {
  const context = routeApi.useRouteContext();
  const { user, isAuthenticated } = context.auth;

  return useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => Promise.resolve(user),
    enabled: isAuthenticated && !!user,
    staleTime: Infinity, // User data rarely changes
  });
}
