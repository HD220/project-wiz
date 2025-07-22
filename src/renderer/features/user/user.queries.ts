import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Theme } from "@/main/features/user/user.types";

import { userApi } from "@/renderer/features/user/user.api";

export function useUserTheme(userId: string | undefined) {
  return useQuery({
    queryKey: ["user", "theme", userId],
    queryFn: () => userApi.getTheme(userId!),
    enabled: !!userId,
    select: (response) => {
      if (response.success && response.data) {
        return response.data as Theme;
      }
      throw new Error(response.error || "Failed to get theme");
    },
  });
}

export function useUpdateUserTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, theme }: { userId: string; theme: Theme }) =>
      userApi.updateTheme(userId, theme),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.setQueryData(
          ["user", "theme", variables.userId],
          variables.theme,
        );
        queryClient.invalidateQueries({
          queryKey: ["user", "theme"],
        });
      } else {
        throw new Error(response.error || "Failed to update theme");
      }
    },
  });
}
