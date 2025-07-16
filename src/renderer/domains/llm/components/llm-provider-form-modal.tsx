import type { LlmProviderDto } from "@/shared/types/domains/llm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

interface LlmProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: LlmProviderDto | null;
}

export function LlmProviderFormModal({
  isOpen,
  onClose,
  provider,
}: LlmProviderFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {provider ? "Edit LLM Provider" : "New LLM Provider"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>LLM Provider form implementation will go here...</p>
          {provider && (
            <p className="text-sm text-gray-500">
              Editing provider: {provider.name || provider.id}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
