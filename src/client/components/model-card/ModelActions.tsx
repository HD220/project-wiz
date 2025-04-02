import { Button } from "@/components/ui/button.js";
import type { ModelStatus } from "./types.js";

interface ModelActionsProps {
  status: ModelStatus;
  isActive: boolean;
  modelId: string;
  onActivate?: (modelId: string) => void;
  onDownload?: (modelId: string) => Promise<void>;
}

export function ModelActions({
  status,
  isActive,
  modelId,
  onActivate,
  onDownload,
}: ModelActionsProps) {
  if (status === "downloaded") {
    return isActive ? (
      <Button size="sm" className="ml-auto w-48" variant="secondary" disabled>
        Active
      </Button>
    ) : (
      <Button
        size="sm"
        className="ml-auto w-48"
        onClick={() => onActivate?.(modelId)}
      >
        Activate
      </Button>
    );
  }

  return (
    <div className="relative w-48 ml-auto">
      <Button
        size="sm"
        className="w-full"
        onClick={() => onDownload?.(modelId)}
      >
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Download
        </>
      </Button>
    </div>
  );
}
