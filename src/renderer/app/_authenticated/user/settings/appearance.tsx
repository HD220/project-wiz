import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Moon, Sun, Palette, Zap, Contrast, Eye } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { Label } from "@/renderer/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/renderer/components/ui/radio-group";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { Switch } from "@/renderer/components/ui/switch";

function AppearancePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState("100");
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [smoothScrolling, setSmoothScrolling] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    // Basic validation: ensure valid theme value
    const validThemes = ["light", "dark", "system"];
    if (!validThemes.includes(newTheme)) {
      setError("Invalid theme selection");
      return;
    }
    setError(null);
    setTheme(newTheme);
  };

  const handleZoomChange = (value: string) => {
    // Basic validation: ensure valid zoom level
    const validZooms = ["80", "90", "100", "110", "125", "150"];
    if (!validZooms.includes(value)) {
      setError("Invalid zoom level");
      return;
    }
    setError(null);
    setZoomLevel(value);
  };

  const handleSwitchChange = (
    setter: (value: boolean) => void,
    value: boolean,
  ) => {
    setError(null);
    setter(value);
  };

  return (
    <div className="h-full w-full">
      <ScrollArea className="h-full">
        <div className="max-w-2xl space-y-[var(--spacing-layout-md)]">
          {/* Page Header - Discord Style */}
          <div className="space-y-[var(--spacing-component-sm)]">
            <h1 className="text-xl font-semibold text-foreground">
              Appearance
            </h1>
            <p className="text-sm text-muted-foreground">
              Customize how Project Wiz looks and feels on your device.
            </p>

            {/* Error message */}
            {error && (
              <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
          </div>

          {/* Theme Selection - Discord Style Compact */}
          <div className="space-y-[var(--spacing-component-lg)]">
            <div className="space-y-[var(--spacing-component-sm)]">
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Theme</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose your theme preference. System will match your device
                settings.
              </p>
            </div>

            {/* Theme Preview Cards */}
            <div className="grid grid-cols-3 gap-[var(--spacing-component-sm)]">
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
                  <button
                    key={themeOption.id}
                    type="button"
                    className={`relative cursor-pointer rounded-lg border-2 p-[var(--spacing-component-sm)] transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                    onClick={() =>
                      handleThemeChange(
                        themeOption.id as "light" | "dark" | "system",
                      )
                    }
                    aria-label={`Select ${themeOption.label} theme`}
                    aria-pressed={isSelected}
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
                    <div className="flex items-center gap-[var(--spacing-component-sm)]">
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
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Display Settings */}
          <div className="space-y-[var(--spacing-component-lg)]">
            <div className="space-y-[var(--spacing-component-sm)]">
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Display</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Adjust visual settings for better accessibility and preference.
              </p>
            </div>

            {/* Compact Settings List */}
            <div className="space-y-[var(--spacing-component-md)]">
              {/* High Contrast */}
              <div className="flex items-center justify-between py-[var(--spacing-component-sm)]">
                <div className="space-y-[var(--spacing-component-xs)]">
                  <Label className="text-sm font-medium">High Contrast</Label>
                  <p className="text-xs text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={isHighContrast}
                  onCheckedChange={(value) =>
                    handleSwitchChange(setIsHighContrast, value)
                  }
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between py-[var(--spacing-component-sm)]">
                <div className="space-y-[var(--spacing-component-xs)]">
                  <Label className="text-sm font-medium">Reduced Motion</Label>
                  <p className="text-xs text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  checked={isReducedMotion}
                  onCheckedChange={(value) =>
                    handleSwitchChange(setIsReducedMotion, value)
                  }
                />
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between py-[var(--spacing-component-sm)]">
                <div className="space-y-[var(--spacing-component-xs)]">
                  <Label className="text-sm font-medium">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce spacing for more content on screen
                  </p>
                </div>
                <Switch
                  checked={isCompactMode}
                  onCheckedChange={(value) =>
                    handleSwitchChange(setIsCompactMode, value)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Accessibility Settings */}
          <div className="space-y-[var(--spacing-component-lg)]">
            <div className="space-y-[var(--spacing-component-sm)]">
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <Contrast className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Accessibility</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Options to improve accessibility and usability.
              </p>
            </div>

            {/* Zoom Level */}
            <div className="space-y-[var(--spacing-component-sm)]">
              <Label className="text-sm font-medium">Zoom Level</Label>
              <RadioGroup
                value={zoomLevel}
                onValueChange={handleZoomChange}
                className="flex gap-[var(--spacing-component-md)]"
              >
                {["80", "90", "100", "110", "125", "150"].map((zoom) => (
                  <div
                    key={zoom}
                    className="flex items-center space-x-[var(--spacing-component-sm)]"
                  >
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
          <div className="space-y-[var(--spacing-component-lg)]">
            <div className="space-y-[var(--spacing-component-sm)]">
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Performance</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Settings that may affect performance and resource usage.
              </p>
            </div>

            {/* Performance Options */}
            <div className="space-y-[var(--spacing-component-md)]">
              {/* Hardware Acceleration */}
              <div className="flex items-center justify-between py-[var(--spacing-component-sm)]">
                <div className="space-y-[var(--spacing-component-xs)]">
                  <Label className="text-sm font-medium">
                    Hardware Acceleration
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Use GPU for better performance (requires restart)
                  </p>
                </div>
                <Switch
                  checked={hardwareAcceleration}
                  onCheckedChange={(value) =>
                    handleSwitchChange(setHardwareAcceleration, value)
                  }
                />
              </div>

              {/* Smooth Scrolling */}
              <div className="flex items-center justify-between py-[var(--spacing-component-sm)]">
                <div className="space-y-[var(--spacing-component-xs)]">
                  <Label className="text-sm font-medium">
                    Smooth Scrolling
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Enable smooth scrolling animations
                  </p>
                </div>
                <Switch
                  checked={smoothScrolling}
                  onCheckedChange={(value) =>
                    handleSwitchChange(setSmoothScrolling, value)
                  }
                />
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
