import { useTheme } from "next-themes";
import { useState } from "react";

export function useAppearanceSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState("100");
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);
  const [smoothScrolling, setSmoothScrolling] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    const validThemes = ["light", "dark", "system"];
    if (!validThemes.includes(newTheme)) {
      setError("Invalid theme selection");
      return;
    }
    setError(null);
    setTheme(newTheme);
  };

  const handleZoomChange = (value: string) => {
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

  return {
    theme,
    setTheme: handleThemeChange,
    resolvedTheme,
    isHighContrast,
    setIsHighContrast: (value: boolean) =>
      handleSwitchChange(setIsHighContrast, value),
    isReducedMotion,
    setIsReducedMotion: (value: boolean) =>
      handleSwitchChange(setIsReducedMotion, value),
    isCompactMode,
    setIsCompactMode: (value: boolean) =>
      handleSwitchChange(setIsCompactMode, value),
    zoomLevel,
    setZoomLevel: handleZoomChange,
    hardwareAcceleration,
    setHardwareAcceleration: (value: boolean) =>
      handleSwitchChange(setHardwareAcceleration, value),
    smoothScrolling,
    setSmoothScrolling: (value: boolean) =>
      handleSwitchChange(setSmoothScrolling, value),
    error,
  };
}
