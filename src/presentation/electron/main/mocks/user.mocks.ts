import { UserProfile } from "@/shared/ipc-types";

export let mockUserProfile: UserProfile = {
  id: "user-123",
  displayName: "WizKid",
  email: "wizkid@example.com",
  avatarUrl: "https://example.com/avatar.png",
};

export const updateMockUserProfile = (
  updatedProfile: Partial<UserProfile>
): UserProfile => {
  mockUserProfile = {
    ...mockUserProfile,
    ...updatedProfile,
  };
  return mockUserProfile;
};