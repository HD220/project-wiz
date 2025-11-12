import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProviderCard } from './provider-card';
import { ProviderForm } from './provider-form';
import { UpdateApiKeyForm } from './update-api-key-form';
import { useProvidersStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import type { LlmProvider } from '@/lib/types';

export function ProviderList() {
  const { token } = useAuthStore();
  const { providers, fetchProviders, deleteProvider, isLoading } =
    useProvidersStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LlmProvider | null>(
    null
  );
  const [updatingApiKeyProvider, setUpdatingApiKeyProvider] =
    useState<LlmProvider | null>(null);

  useEffect(() => {
    if (token) {
      fetchProviders(token);
    }
  }, [token, fetchProviders]);

  const handleDelete = async (provider: LlmProvider) => {
    if (!token) return;

    if (confirm(`Are you sure you want to delete ${provider.name}?`)) {
      try {
        await deleteProvider(provider.id, token);
      } catch (error) {
        console.error('Failed to delete provider:', error);
      }
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditingProvider(null);
  };

  const handleUpdateApiKeySuccess = () => {
    setUpdatingApiKeyProvider(null);
  };

  if (isLoading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading providers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">LLM Providers</h2>
          <p className="text-muted-foreground">
            Manage your language model providers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Provider</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Provider</DialogTitle>
            </DialogHeader>
            <ProviderForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">No providers yet</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Add Your First Provider
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onEdit={setEditingProvider}
              onUpdateApiKey={setUpdatingApiKeyProvider}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog
        open={editingProvider !== null}
        onOpenChange={(open) => !open && setEditingProvider(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
          </DialogHeader>
          {editingProvider && (
            <ProviderForm
              provider={editingProvider}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingProvider(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={updatingApiKeyProvider !== null}
        onOpenChange={(open) => !open && setUpdatingApiKeyProvider(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update API Key</DialogTitle>
          </DialogHeader>
          {updatingApiKeyProvider && (
            <UpdateApiKeyForm
              providerId={updatingApiKeyProvider.id}
              onSuccess={handleUpdateApiKeySuccess}
              onCancel={() => setUpdatingApiKeyProvider(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
