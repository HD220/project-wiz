import { DocumentationHeaderTitle } from "./documentation-header-title";
import { DocumentationHeaderActions } from "./documentation-header-actions";

interface DocumentationHeaderProps {
  /**
   * No required props at the moment. This interface is designed to be easily extended
   * in the future to receive handlers, state, or other properties as needed.
   */
}

export function DocumentationHeader({}: DocumentationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <DocumentationHeaderTitle />
      <DocumentationHeaderActions />
    </div>
  );
}
