import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AgentCard } from './agent-card';
import { AgentForm } from './agent-form';
import { useAgentsStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import type { Agent } from '@/lib/types';

export function AgentList() {
  const { token } = useAuthStore();
  const { agents, fetchAgents, deleteAgent, isLoading } = useAgentsStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (token) {
      fetchAgents(token);
    }
  }, [token, fetchAgents]);

  const handleDelete = async (agent: Agent) => {
    if (!token) return;

    if (confirm(`Are you sure you want to delete ${agent.user.name}?`)) {
      try {
        await deleteAgent(agent.user.id, token);
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditingAgent(null);
  };

  if (isLoading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agents</h2>
          <p className="text-muted-foreground">Manage your AI agents</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Agent</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
            </DialogHeader>
            <AgentForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">No agents yet</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create Your First Agent
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.user.id}
              agent={agent}
              onEdit={setEditingAgent}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog
        open={editingAgent !== null}
        onOpenChange={(open) => !open && setEditingAgent(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
          </DialogHeader>
          {editingAgent && (
            <AgentForm
              agent={editingAgent}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingAgent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
