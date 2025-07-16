import { User, Zap, Palette, Bell, Shield, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSettingsTab } from "./user-settings-tab";
import { InterfaceSettingsTab } from "./interface-settings-tab";
import { NotificationSettingsTab } from "./notification-settings-tab";
import { LlmProviderManagement } from "@/domains/llm/components/llm-provider-management";

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
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="user" className="gap-2">
          <User className="w-4 h-4" />
          Usuário
        </TabsTrigger>
        <TabsTrigger value="llm" className="gap-2">
          <Zap className="w-4 h-4" />
          LLM
        </TabsTrigger>
        <TabsTrigger value="interface" className="gap-2">
          <Palette className="w-4 h-4" />
          Interface
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="w-4 h-4" />
          Notificações
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2">
          <Shield className="w-4 h-4" />
          Segurança
        </TabsTrigger>
        <TabsTrigger value="advanced" className="gap-2">
          <Database className="w-4 h-4" />
          Avançado
        </TabsTrigger>
      </TabsList>

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
    </Tabs>
  );
}
