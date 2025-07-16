import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserSettingsTabProps {
  settings: {
    username: string;
    email: string;
  };
  onUpdate: (field: string, value: string) => void;
}

export function UserSettingsTab({ settings, onUpdate }: UserSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Usuário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="username">Nome de Usuário</Label>
          <Input
            id="username"
            value={settings.username}
            onChange={(e) => onUpdate("username", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => onUpdate("email", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
