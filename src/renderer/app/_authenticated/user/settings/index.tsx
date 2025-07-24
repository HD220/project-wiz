import { createFileRoute } from "@tanstack/react-router";
import { User, Shield } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";

function MyAccountPage() {
  return (
    <div className="pt-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Minha conta
        </h1>
      </div>

      {/* Tabs - igual Discord */}
      <div className="flex gap-8 border-b border-border mb-8">
        <button className="pb-3 border-b-2 border-blue-500 text-sm font-medium text-blue-500">
          Segurança
        </button>
        <button className="pb-3 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Status
        </button>
      </div>

      {/* Profile Banner - IGUAL DISCORD */}
      <div className="relative mb-8">
        {/* Banner background cinza claro */}
        <div className="h-[100px] bg-muted/20 rounded-t-lg"></div>

        {/* Profile info sobreposto */}
        <div className="bg-background rounded-b-lg p-6 -mt-8 relative">
          <div className="flex items-center gap-4">
            {/* Avatar grande */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background -mt-8">
              <User className="w-6 h-6 text-primary" />
            </div>

            {/* Nome e badges */}
            <div className="flex-1 pt-2">
              <h2 className="text-xl font-semibold">Nicolas Fraga Faust</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-4 bg-purple-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">💜</span>
                </div>
                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">+</span>
                </div>
              </div>
            </div>

            {/* Botão editar */}
            <Button
              variant="outline"
              className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
            >
              Editar perfil de usuário
            </Button>
          </div>
        </div>
      </div>

      {/* Campos sem cards - igual Discord */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-foreground">
              Nome Exibido
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Nicolas Fraga Faust
            </p>
          </div>
          <Button variant="outline" size="sm">
            Editar
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-foreground">
              Nome De Usuário
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              nicolasfragafaust
            </p>
          </div>
          <Button variant="outline" size="sm">
            Editar
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-foreground">
              E-Mail
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              ************@gmail.com{" "}
              <button className="text-blue-500 hover:underline">Mostrar</button>
            </p>
          </div>
          <Button variant="outline" size="sm">
            Editar
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-foreground">
              Telefone
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              ********8037{" "}
              <button className="text-blue-500 hover:underline">Mostrar</button>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-500 hover:bg-red-50"
            >
              Remover
            </Button>
            <Button variant="outline" size="sm">
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Seção autenticação */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Senha e autenticação</h2>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-600">
            Autenticação Multifatorial Ativada
          </span>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/settings/")({
  component: MyAccountPage,
});
