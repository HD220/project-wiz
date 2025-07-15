import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { useTheme } from "@/contexts/theme-context";
import { SettingsHeader } from "@/domains/users/components/settings/settings-header";
import { SettingsTabs } from "@/domains/users/components/settings/settings-tabs";
import { useUser } from "@/domains/users/hooks/use-user.hook";

export const Route = createFileRoute("/(user)/settings/")({
  component: UserSettingsPage,
});

export function UserSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currentUser, updateSettings, updateProfile } = useUser();
  
  const [settings, setSettings] = useState({
    // User Settings
    username: "Usuário",
    email: "usuario@example.com",

    // Interface Settings
    language: "pt-BR",

    // Notification Settings
    enableNotifications: true,
    soundEnabled: true,
    desktopNotifications: false,
  });

  const handleUpdateSettings = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Update user profile
      await updateProfile({
        name: settings.username,
        email: settings.email,
      });

      // Update user settings
      await updateSettings({
        preferences: {
          language: settings.language as "en" | "pt-BR",
          notifications: settings.enableNotifications,
        },
      });

      console.log("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <SettingsHeader onSave={handleSave} />
        <SettingsTabs
          settings={settings}
          theme={theme}
          onUpdateSettings={handleUpdateSettings}
          onThemeChange={setTheme}
        />
      </div>
    </div>
  );
}