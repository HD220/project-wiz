import { Dialog, DialogContent, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { useAgents } from '../../agents/hooks/use-agents.hook';
import { useNewConversationForm } from '../hooks/use-new-conversation-form.hook';
import { NewConversationModalHeader } from './new-conversation-modal-header';
import { NewConversationAgentSelector } from './new-conversation-agent-selector';
import { NewConversationAgentPreview } from './new-conversation-agent-preview';

interface NewConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationModal({ open, onOpenChange }: NewConversationModalProps) {
  const { activeAgents, isLoading: isLoadingAgents } = useAgents();
  const form = useNewConversationForm(() => onOpenChange(false), activeAgents);

  const selectedAgent = activeAgents?.find(
    (agent) => agent.id === form.selectedAgentId,
  );

  return (
    <Dialog open={open} onOpenChange={form.handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <NewConversationModalHeader />

        <form onSubmit={form.handleSubmit} className="space-y-4">
          <NewConversationAgentSelector
            selectedAgentId={form.selectedAgentId}
            setSelectedAgentId={form.setSelectedAgentId}
            agents={activeAgents}
            isLoading={isLoadingAgents}
          />

          {selectedAgent && (
            <NewConversationAgentPreview agent={selectedAgent} />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={form.handleClose}
              disabled={form.isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!form.selectedAgentId.trim() || form.isSubmitting}
            >
              {form.isSubmitting ? "Criando..." : "Iniciar Conversa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}