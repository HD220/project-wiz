import { Button } from "@/components/ui/button.js";
import { ModelCardActions } from "./types";

interface ActivateButtonProps {
  isActive: boolean;
  onActivate?: (modelId: string) => void;
  modelId: string;
}

function ActivateButton({ isActive, onActivate, modelId }: ActivateButtonProps) {
  if (isActive) {
    return (
      <Button size="sm" className="ml-auto w-48" variant="secondary" disabled>
        Active
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className="ml-auto w-48"
      onClick={() => onActivate?.(modelId)}
    >
      Activate
    </Button>
  );
}

interface DownloadButtonProps {
  onDownload?: (modelId: string) => void;
  modelId: string;
}

function DownloadButton({ onDownload, modelId }: DownloadButtonProps) {
  return (
    <div className="relative w-48 ml-auto">
      <Button size="sm" className="w-full" onClick={() => onDownload?.(modelId)}>
        <>
          <DownloadIcon />
          Download
        </>
      </Button>
    </div>
  );
}

function DownloadIcon() {
  return (
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
  );
}

export function ModelActions({
  model,
  onActivate,
  onDownload,
}: ModelCardActions) {
  if (model.state.status === "downloaded") {
    return (
      <ActivateButton
        isActive={model.state.isActive}
        onActivate={onActivate}
        modelId={model.id}
      />
    );
  }

  return (
    <DownloadButton onDownload={onDownload} modelId={model.id} />
  );
}
