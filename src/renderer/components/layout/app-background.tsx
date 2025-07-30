import { ReactNode } from "react";

import { cn } from "@/renderer/lib/utils";

interface AppBackgroundProps {
  children: ReactNode;
  className?: string;
  overlayIntensity?: "light" | "medium" | "strong";
}

export function AppBackground(props: AppBackgroundProps) {
  const { children, className, overlayIntensity = "light" } = props;

  const overlayOpacity = {
    light: "0.02",
    medium: "0.05",
    strong: "0.08",
  };

  return (
    <div
      className={cn("h-full w-full relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(135deg, var(--background), rgba(128, 128, 128, 0.05))`,
        backgroundSize: "100% 100%, 100% 100%",
        backgroundRepeat: "repeat, no-repeat",
      }}
    >
      {/* Overlay for stripe pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, ${overlayOpacity[overlayIntensity]}) 0px,
              rgba(255, 255, 255, ${overlayOpacity[overlayIntensity]}) 3px,
              rgba(255, 255, 255, 0) 200px
            )
          `,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
