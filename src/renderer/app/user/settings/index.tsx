import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTheme } from "@/renderer/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Zap,
  Palette,
  Bell,
  Shield,
  Database,
  Key,
  Globe,
  Monitor,
  Save,
  TestTube,
} from "lucide-react";

export const Route = createFileRoute("/user/settings/")({
  component: UserSettingsPage,
});

export function UserSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    // User Settings
    username: "Usuário",
    email: "usuario@example.com",
    
    // LLM Settings
    defaultLLM: "openai",
    openaiApiKey: "",
    deepseekApiKey: "",
    maxTokens: 4000,
    temperature: 0.7,
    
    // Interface Settings
    theme: theme, // Initialize with current theme from context
    language: "pt-BR",
    compactMode: false,
    
    // Notification Settings
    enableNotifications: true,
    soundNotifications: true,
    agentStatusUpdates: true,
    taskCompletionAlerts: true,
    
    // Security Settings
    autoLock: false,
    lockTimeout: 15,
    
    // Advanced Settings
    enableDebugMode: false,
    maxConcurrentAgents: 5,
    autoSaveInterval: 30,
  });

  useEffect(() => {
    setTheme(settings.theme as "light" | "dark" | "system");
  }, [settings.theme, setTheme]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving settings:", settings);
  };

  const testLLMConnection = (provider: string) => {
    // TODO: Implement LLM connection test
    console.log(`Testing ${provider} connection`);
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Save button moved to content area */}
        <div className="flex justify-end mb-6">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </div>
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

          {/* User Settings */}
          <TabsContent value="user" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Usuário</Label>
                    <Input
                      id="username"
                      value={settings.username}
                      onChange={(e) => updateSetting("username", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSetting("email", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LLM Settings */}
          <TabsContent value="llm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Configurações de LLM
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default LLM */}
                <div className="space-y-2">
                  <Label>Provedor Padrão</Label>
                  <Select
                    value={settings.defaultLLM}
                    onValueChange={(value) => updateSetting("defaultLLM", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* OpenAI Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">OpenAI</h4>
                    <Badge variant={settings.openaiApiKey ? "default" : "secondary"}>
                      {settings.openaiApiKey ? "Configurado" : "Não configurado"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="openai-key">Chave da API</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={settings.openaiApiKey}
                        onChange={(e) => updateSetting("openaiApiKey", e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => testLLMConnection("openai")}
                        className="w-full gap-2"
                      >
                        <TestTube className="w-4 h-4" />
                        Testar
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* DeepSeek Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">DeepSeek</h4>
                    <Badge variant={settings.deepseekApiKey ? "default" : "secondary"}>
                      {settings.deepseekApiKey ? "Configurado" : "Não configurado"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="deepseek-key">Chave da API</Label>
                      <Input
                        id="deepseek-key"
                        type="password"
                        placeholder="sk-..."
                        value={settings.deepseekApiKey}
                        onChange={(e) => updateSetting("deepseekApiKey", e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => testLLMConnection("deepseek")}
                        className="w-full gap-2"
                      >
                        <TestTube className="w-4 h-4" />
                        Testar
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Generation Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Parâmetros de Geração</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-tokens">Máximo de Tokens</Label>
                      <Input
                        id="max-tokens"
                        type="number"
                        min={100}
                        max={8000}
                        value={settings.maxTokens}
                        onChange={(e) => updateSetting("maxTokens", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperatura</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min={0}
                        max={2}
                        step={0.1}
                        value={settings.temperature}
                        onChange={(e) => updateSetting("temperature", parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interface Settings */}
          <TabsContent value="interface" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Aparência e Interface
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => updateSetting("theme", value)}
                    >
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
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => updateSetting("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (BR)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduz o espaçamento entre elementos da interface
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting("compactMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Ativar Notificações</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações do sistema
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => updateSetting("enableNotifications", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sons de Notificação</Label>
                    <p className="text-sm text-muted-foreground">
                      Reproduzir sons para notificações
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundNotifications}
                    onCheckedChange={(checked) => updateSetting("soundNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Status dos Agentes</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando agentes ficam online/offline
                    </p>
                  </div>
                  <Switch
                    checked={settings.agentStatusUpdates}
                    onCheckedChange={(checked) => updateSetting("agentStatusUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Conclusão de Tarefas</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando tarefas são concluídas
                    </p>
                  </div>
                  <Switch
                    checked={settings.taskCompletionAlerts}
                    onCheckedChange={(checked) => updateSetting("taskCompletionAlerts", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bloqueio Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Bloquear aplicação após inatividade
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoLock}
                    onCheckedChange={(checked) => updateSetting("autoLock", checked)}
                  />
                </div>

                {settings.autoLock && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="lock-timeout">Tempo de Bloqueio (minutos)</Label>
                      <Input
                        id="lock-timeout"
                        type="number"
                        min={1}
                        max={60}
                        value={settings.lockTimeout}
                        onChange={(e) => updateSetting("lockTimeout", parseInt(e.target.value))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Configurações Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Debug</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar logs detalhados para desenvolvimento
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableDebugMode}
                    onCheckedChange={(checked) => updateSetting("enableDebugMode", checked)}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-agents">Máximo de Agentes Simultâneos</Label>
                    <Input
                      id="max-agents"
                      type="number"
                      min={1}
                      max={20}
                      value={settings.maxConcurrentAgents}
                      onChange={(e) => updateSetting("maxConcurrentAgents", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="autosave">Intervalo de Auto-Save (segundos)</Label>
                    <Input
                      id="autosave"
                      type="number"
                      min={10}
                      max={300}
                      value={settings.autoSaveInterval}
                      onChange={(e) => updateSetting("autoSaveInterval", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
