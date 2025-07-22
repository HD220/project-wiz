// User types for frontend - focused on UI concerns

// Import types first
import type {
  AuthenticatedUser,
  Theme,
  UserProfile,
  UserPreferences,
} from "@/main/features/user/user.types";

// Re-export backend types for consistency
export type { AuthenticatedUser, Theme, UserProfile, UserPreferences };

// Frontend-specific types for user UI
export interface UserStatusType {
  status: "online" | "away" | "busy" | "offline";
  lastSeen?: Date;
}

export interface UserAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  imageUrl?: string;
}

export interface UserStatusProps {
  status?: "online" | "away" | "busy" | "offline";
  className?: string;
  showLabel?: boolean;
}

// UI state types
export interface UserUIState {
  isProfileOpen: boolean;
  isSettingsOpen: boolean;
  selectedTheme: Theme;
}

// Form types for user settings
export interface ThemeFormData {
  theme: Theme;
}

// User preferences UI config
export interface UserPreferencesUI {
  theme: {
    options: { value: Theme; label: string; description?: string }[];
    defaultValue: Theme;
  };
}
