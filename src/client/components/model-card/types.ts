
export type ModelStatus = "downloaded" | "not_downloaded";

export interface ModelMetadata {
  id: string;
  name: string;
  modelId: string;
  size: string;
  description: string;
  state: ModelState
}

export interface ModelState {
  status: ModelStatus;
  lastUsed: string | null;
  isActive: boolean;
}

export interface ModelCardActions {
  model: ModelMetadata
  onActivate?: (modelId: string) => void;
  onDownload?: (modelId: string) => Promise<void>;
}

