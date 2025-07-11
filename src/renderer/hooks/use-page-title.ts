import { useEffect } from "react";
import { createPortal } from "react-dom";

export function usePageTitle(title: string, icon?: React.ReactNode) {
  useEffect(() => {
    const headerElement = document.getElementById("channel-header-content");
    if (!headerElement) return;

    const titleContent = (
      <div className="flex items-center gap-2 min-w-0">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <h1 className="font-semibold text-foreground truncate">{title}</h1>
      </div>
    );

    const portalContainer = document.createElement("div");
    portalContainer.className = "flex items-center gap-2 min-w-0";
    headerElement.appendChild(portalContainer);

    const portal = createPortal(titleContent, portalContainer);

    // Cleanup
    return () => {
      if (headerElement.contains(portalContainer)) {
        headerElement.removeChild(portalContainer);
      }
    };
  }, [title, icon]);
}