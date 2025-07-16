export interface ElectronStyleProps {
  WebkitAppRegion?: "drag" | "no-drag";
}

export interface WindowControls {
  isMaximized: boolean;
  setIsMaximized: (maximized: boolean) => void;
}
