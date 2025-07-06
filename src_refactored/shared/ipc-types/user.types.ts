export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export interface UserProfileFormData {
  displayName: string;
  avatarUrl?: string;
}

// User Profile
export type GetUserProfileRequest = void;
export type GetUserProfileResponse = UserProfile | null;

export type UpdateUserProfileRequest = {
  updates: Partial<UserProfileFormData>;
};
export type UpdateUserProfileResponse = UserProfile;
