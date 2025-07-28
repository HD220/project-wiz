import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Moon, Sun, Palette, Zap, Contrast, Eye } from "lucide-react";
import { useState } from "react";

import { Label } from "@/renderer/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/renderer/components/ui/radio-group";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { Switch } from "@/renderer/components/ui/switch";
import { useTheme } from "next-themes";

function AppearancePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full">
        <div className="max-w-2xl space-y-6">
          {/* Page Header - Discord Style */}
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Appearance
            </h1>
            <p className="text-sm text-muted-foreground">
              Customize how Project Wiz looks and feels on your device.
            </p>
          </div>

          {/* Theme Selection - Discord Style Compact */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Theme</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose your theme preference. System will match your device
                settings.
              </p>
            </div>

            {/* Theme Preview Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: "light",
                  label: "Light",
                  icon: Sun,
                  preview: "bg-white border-gray-200",
                  accent: "bg-blue-500",
                },
                {
                  id: "dark",
                  label: "Dark",
                  icon: Moon,
                  preview: "bg-gray-900 border-gray-700",
                  accent: "bg-blue-400",
                },
                {
                  id: "system",
                  label: "Sync with system",
                  icon: Monitor,
                  preview:
                    resolvedTheme === "dark"
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-200",
                  accent:
                    resolvedTheme === "dark" ? "bg-blue-400" : "bg-blue-500",
                },
              ].map((themeOption) => {
                const isSelected = theme === themeOption.id;
                const Icon = themeOption.icon;

                return (
                  <div
                    key={themeOption.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                    onClick={() =>
                      handleThemeChange(
                        themeOption.id as "light" | "dark" | "system",
                      )
                    }
                  >
                    {/* Theme Preview */}
                    <div
                      className={`h-16 w-full rounded-md border ${themeOption.preview} mb-3 relative overflow-hidden`}
                    >
                      <div
                        className={`absolute top-2 left-2 h-2 w-2 rounded-full ${themeOption.accent}`}
                      />
                      <div
                        className={`absolute top-2 right-2 h-1 w-6 rounded ${themeOption.accent} opacity-60`}
                      />
                      <div
                        className={`absolute bottom-2 left-2 h-1 w-8 rounded ${themeOption.accent} opacity-40`}
                      />
                    </div>

                    {/* Theme Info */}
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {themeOption.label}
                        </p>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-full w-full rounded-full bg-primary-foreground scale-50" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Display Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Display</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Adjust visual settings for better accessibility and preference.
              </p>
            </div>

            {/* Compact Settings List */}
            <div className="space-y-3">
              {/* High Contrast */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">High Contrast</Label>
                  <p className="text-xs text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={isHighContrast}
                  onCheckedChange={setIsHighContrast}
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Reduced Motion</Label>
                  <p className="text-xs text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  checked={isReducedMotion}
                  onCheckedChange={setIsReducedMotion}
                />
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce spacing for more content on screen
                  </p>
                </div>
                <Switch
                  checked={isCompactMode}
                  onCheckedChange={setIsCompactMode}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Accessibility Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Contrast className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Accessibility</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Options to improve accessibility and usability.
              </p>
            </div>

            {/* Zoom Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Zoom Level</Label>
              <RadioGroup defaultValue="100" className="flex gap-4">
                {["80", "90", "100", "110", "125", "150"].map((zoom) => (
                  <div key={zoom} className="flex items-center space-x-2">
                    <RadioGroupItem value={zoom} id={`zoom-${zoom}`} />
                    <Label
                      htmlFor={`zoom-${zoom}`}
                      className="text-sm cursor-pointer"
                    >
                      {zoom}%
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Adjust the overall size of the interface
              </p>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Performance</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Settings that may affect performance and resource usage.
              </p>
            </div>

            {/* Performance Options */}
            <div className="space-y-3">
              {/* Hardware Acceleration */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Hardware Acceleration
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Use GPU for better performance (requires restart)
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              {/* Smooth Scrolling */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Smooth Scrolling
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable smooth scrolling animations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Bottom Spacing */}
          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/appearance",
)({
  component: AppearancePage,
});
