import { create } from 'zustand';
import { UserDto } from '../../../../shared/types/domains/users/user.types';

interface UserState {
  currentUser: UserDto | null;
  setCurrentUser: (user: UserDto | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));