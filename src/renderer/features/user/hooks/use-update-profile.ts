import { useMutation, useQueryClient } from "@tanstack/react-query";

import { UserAPI } from "@/renderer/features/user/user.api";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      UserAPI.updateProfile(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(["user", data.id], data);
    },
  });
}
