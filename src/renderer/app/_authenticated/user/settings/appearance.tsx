import { createFileRoute } from "@tanstack/react-router";
import { Palette, Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { Label } from "@/renderer/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/renderer/components/ui/radio-group";
function AppearancePage() {
  return (
    <div className="h-full w-full">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Appearance</h1>
          <p className="text-muted-foreground text-sm">
            Customize the look and feel of your workspace
          </p>
        </div>

        {/* Theme Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme
            </CardTitle>
            <CardDescription>
              Choose how the app looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Theme Mode</Label>
              <RadioGroup
                defaultValue="dark"
                className="grid grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label
                    htmlFor="light"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label
                    htmlFor="dark"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label
                    htmlFor="system"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                System will automatically adjust based on your OS theme
                preference
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Bottom padding for visual spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/appearance",
)({
  component: AppearancePage,
});
