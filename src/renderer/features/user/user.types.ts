/**
 * User types for renderer process
 */

export type Theme = "light" | "dark" | "system";

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  name?: string;
  avatar: string | null;
  theme: Theme;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  email: string;
  theme: Theme;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: Theme;
}

export interface UserSummary {
  id: string;
  name: string;
  type: string;
  username?: string;
  displayName?: string | null;
  avatar?: string | null;
}

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
