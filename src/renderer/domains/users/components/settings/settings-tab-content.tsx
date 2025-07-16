import { TabsContent } from "@/components/ui/tabs";
import { UserSettingsTab } from "./user-settings-tab";
import { InterfaceSettingsTab } from "./interface-settings-tab";
import { NotificationSettingsTab } from "./notification-settings-tab";
import { LlmProviderManagement } from "@/domains/llm/components/llm-provider-management";

interface SettingsTabContentProps {
  settings: any;
  theme: string;
  onUpdateSettings: (field: string, value: any) => void;
  onThemeChange: (theme: string) => void;
}

export function SettingsTabContent({
  settings,
  theme,
  onUpdateSettings,
  onThemeChange,
}: SettingsTabContentProps) {
  return (
    <>
      <TabsContent value="user">
        <UserSettingsTab settings={settings} onUpdate={onUpdateSettings} />
      </TabsContent>

      <TabsContent value="llm">
        <LlmProviderManagement />
      </TabsContent>

      <TabsContent value="interface">
        <InterfaceSettingsTab
          theme={theme}
          language={settings.language}
          onThemeChange={onThemeChange}
          onLanguageChange={(lang) => onUpdateSettings("language", lang)}
        />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationSettingsTab
          settings={settings}
          onUpdate={onUpdateSettings}
        />
      </TabsContent>

      <TabsContent value="security">
        <div>Security settings coming soon...</div>
      </TabsContent>

      <TabsContent value="advanced">
        <div>Advanced settings coming soon...</div>
      </TabsContent>
    </>
  );
}