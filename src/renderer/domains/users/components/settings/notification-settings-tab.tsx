import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationSettingsTabProps {
  settings: {
    enableNotifications: boolean;
    soundEnabled: boolean;
    desktopNotifications: boolean;
  };
  onUpdate: (field: string, value: boolean) => void;
}

export function NotificationSettingsTab({
  settings,
  onUpdate,
}: NotificationSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Notificações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications">Ativar notificações</Label>
          <Switch
            id="notifications"
            checked={settings.enableNotifications}
            onCheckedChange={(checked) =>
              onUpdate("enableNotifications", checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="sound">Som das notificações</Label>
          <Switch
            id="sound"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => onUpdate("soundEnabled", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="desktop">Notificações desktop</Label>
          <Switch
            id="desktop"
            checked={settings.desktopNotifications}
            onCheckedChange={(checked) =>
              onUpdate("desktopNotifications", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
