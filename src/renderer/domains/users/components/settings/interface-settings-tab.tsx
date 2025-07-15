import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InterfaceSettingsTabProps {
  theme: string;
  language: string;
  onThemeChange: (theme: string) => void;
  onLanguageChange: (language: string) => void;
}

export function InterfaceSettingsTab({ 
  theme, 
  language, 
  onThemeChange, 
  onLanguageChange 
}: InterfaceSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Interface</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Tema</Label>
          <Select value={theme} onValueChange={onThemeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Idioma</Label>
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}