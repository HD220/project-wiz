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
