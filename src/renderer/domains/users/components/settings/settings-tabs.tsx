import { Tabs } from "@/components/ui/tabs";

import { SettingsTabContent } from "./settings-tab-content";
import { SettingsTabList } from "./settings-tab-list";

interface SettingsTabsProps {
  settings: any;
  theme: string;
  onUpdateSettings: (field: string, value: any) => void;
  onThemeChange: (theme: string) => void;
}

export function SettingsTabs({
  settings,
  theme,
  onUpdateSettings,
  onThemeChange,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="user" className="space-y-6">
      <SettingsTabList />
      <SettingsTabContent
        settings={settings}
        theme={theme}
        onUpdateSettings={onUpdateSettings}
        onThemeChange={onThemeChange}
      />
    </Tabs>
  );
}
