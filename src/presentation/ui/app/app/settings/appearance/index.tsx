import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sun, Moon, MonitorSmartphone } from "lucide-react";
import React from "react";

// Import useTheme
import { useTheme } from "@/components/common/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/ui/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const themeOptions: {
  value: ThemeOption;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: MonitorSmartphone },
];

function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link to="/app/settings">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Configurações
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Aparência</CardTitle>
          <CardDescription>
            Personalize o tema visual da aplicação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-2 block">
              Tema da Interface
            </Label>
            <RadioGroup
              value={theme}
              onValueChange={(value: ThemeOption) => setTheme(value)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {themeOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`theme-${option.value}`}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    theme === option.value &&
                      "border-primary ring-2 ring-primary"
                  )}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`theme-${option.value}`}
                    className="sr-only"
                  />
                  <option.icon
                    className={cn(
                      "h-8 w-8 mb-2",
                      theme === option.value
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="font-medium">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-3">
              Selecionar &quot;Sistema&quot; usará a preferência de tema do seu
              sistema operacional.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">
              Pré-visualização do Tema
            </h3>
            <div className="p-6 rounded-lg border bg-background text-foreground">
              <h4 className="font-semibold text-xl mb-2 text-primary">
                Título de Exemplo
              </h4>
              <p className="mb-1">
                Este é um parágrafo de exemplo para demonstrar o tema atual.
              </p>
              <Button variant="default" size="sm" className="mr-2">
                Botão Primário
              </Button>
              <Button variant="secondary" size="sm">
                Botão Secundário
              </Button>
              <div className="mt-4 p-3 bg-card text-card-foreground rounded-md border">
                <p className="text-sm">
                  Isto é um card dentro da pré-visualização.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/app/settings/appearance/")({
  component: AppearanceSettingsPage,
});
