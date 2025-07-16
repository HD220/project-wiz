import { User, Zap, Palette, Bell, Shield, Database } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsTabList() {
  return (
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
  );
}