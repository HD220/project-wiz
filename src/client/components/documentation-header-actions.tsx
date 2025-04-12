import { ExportButton } from "./export-button";
import { RefreshButton } from "./refresh-button";

export function DocumentationHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ExportButton />
      <RefreshButton />
    </div>
  );
}