import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  UpdateUserDto,
  UpdateUserSettingsDto,
} from "../../../../shared/types/domains/users/user.types";
import { userService } from "../services/user.service";
import { useUserStore } from "../stores/user.store";

export function useUser(userId?: string) {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getById(userId!),
    enabled: !!userId,
  });

  const { data: userData } = queryResult;

  const createUser = useMutation({
    mutationFn: userService.create,
    onSuccess: (user) => {
      setCurrentUser(user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.updateProfile(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });

  const updateSettings = useMutation({
    mutationFn: ({
      id,
      settings,
    }: {
      id: string;
      settings: UpdateUserSettingsDto;
    }) => userService.updateSettings(id, settings),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });

  return {
    user: userData || currentUser,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    setCurrentUser,
    createUser: createUser.mutate,
    updateProfile: updateProfile.mutate,
    updateSettings: updateSettings.mutate,
  };
}
