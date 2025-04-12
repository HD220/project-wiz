import { ExportButton, RefreshButton } from "@/components/ui";
import { RefreshButton } from "./refresh-button";

export function DocumentationHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ExportButton />
      <RefreshButton />
    </div>
  );
}