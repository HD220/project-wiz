import { useState, useEffect } from "react";

// Electron-optimized breakpoints for desktop app
const ELECTRON_BREAKPOINTS = {
  // Compact mode: Very small window (< 1000px)
  compact: 1000,
  // Tablet mode: Medium window (< 1200px)
  tablet: 1200,
  // Desktop mode: Large window (>= 1200px)
  desktop: 1200,
} as const;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Use 1000px as mobile breakpoint for Electron - below this, sidebars should collapse
    const mql = window.matchMedia(
      `(max-width: ${ELECTRON_BREAKPOINTS.compact - 1}px)`,
    );
    function onChange() {
      setIsMobile(window.innerWidth < ELECTRON_BREAKPOINTS.compact);
    }
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < ELECTRON_BREAKPOINTS.compact);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// New hook for Electron-specific responsive behavior
export function useElectronViewport() {
  const [viewport, setViewport] = useState<{
    width: number;
    height: number;
    mode: "compact" | "tablet" | "desktop";
  }>({
    width: 1200,
    height: 800,
    mode: "desktop",
  });

  useEffect(() => {
    function updateViewport() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let mode: "compact" | "tablet" | "desktop" = "desktop";
      if (width < ELECTRON_BREAKPOINTS.compact) {
        mode = "compact";
      } else if (width < ELECTRON_BREAKPOINTS.tablet) {
        mode = "tablet";
      }

      setViewport({ width, height, mode });
    }

    // Set initial state
    updateViewport();

    // Listen for resize events
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return viewport;
}
