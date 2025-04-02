export type ModelStatus = "downloaded" | "not_downloaded";

export interface ModelMetadata {
  id: string;
  name: string;
  modelId: string;
  size: string;
  description: string;
}

export interface ModelState {
  status: ModelStatus;
  lastUsed: string | null;
  isActive: boolean;
}

export interface ModelCardProps {
  metadata: ModelMetadata;
  state: ModelState;
  onActivate?: (modelId: string) => void;
  onDownload?: (modelId: string) => Promise<void>;
  className?: string;
}
