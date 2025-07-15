import { useSyncExternalStore, useMemo } from "react";

import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserSettingsDto,
} from "../../../../shared/types/user.types";
import { userStore } from "../stores/user.store";

export function useUser() {
  const state = useSyncExternalStore(
    userStore.subscribe,
    userStore.getSnapshot,
    userStore.getServerSnapshot,
  );

  const mutations = useMemo(
    () => ({
      createUser: (data: CreateUserDto) => userStore.createUser(data),
      updateProfile: (data: UpdateUserDto) => userStore.updateProfile(data),
      updateSettings: (data: UpdateUserSettingsDto) =>
        userStore.updateSettings(data),
      deleteUser: (userId: string) => userStore.deleteUser(userId),
    }),
    [],
  );

  const queries = useMemo(
    () => ({
      loadCurrentUser: (userId: string) => userStore.loadCurrentUser(userId),
      getPreferences: (userId: string) => userStore.getPreferences(userId),
    }),
    [],
  );

  return {
    currentUser: state.currentUser,
    isLoading: state.isLoading,
    error: state.error,

    ...mutations,
    ...queries,
  };
}
