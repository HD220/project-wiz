import { UserProfile } from "../../../../shared/types/entities";

export let mockUserProfile: UserProfile = {
  id: "user-123",
  username: "WizKid",
  email: "wizkid@example.com",
  profilePictureUrl: "https://example.com/avatar.png",
  bio: "Enthusiastic developer working on Project Wiz.",
  createdAt: new Date("2023-01-15T10:00:00Z").toISOString(),
  updatedAt: new Date("2023-06-20T15:30:00Z").toISOString(),
};

export const updateMockUserProfile = (
  updatedProfile: Partial<UserProfile>
): UserProfile => {
  mockUserProfile = {
    ...mockUserProfile,
    ...updatedProfile,
    updatedAt: new Date().toISOString(),
  };
  return mockUserProfile;
};
