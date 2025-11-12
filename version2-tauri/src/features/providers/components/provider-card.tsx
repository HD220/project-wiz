import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LlmProvider } from '@/lib/types';

type ProviderCardProps = {
  provider: LlmProvider;
  onEdit?: (provider: LlmProvider) => void;
  onUpdateApiKey?: (provider: LlmProvider) => void;
  onDelete?: (provider: LlmProvider) => void;
};

export function ProviderCard({
  provider,
  onEdit,
  onUpdateApiKey,
  onDelete,
}: ProviderCardProps) {
  const providerTypeLabels: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    deepseek: 'DeepSeek',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{provider.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {providerTypeLabels[provider.provider_type] || provider.provider_type}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {provider.base_url && (
          <div>
            <h4 className="text-sm font-semibold mb-1">Base URL</h4>
            <p className="text-sm text-muted-foreground break-all">
              {provider.base_url}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {provider.is_default === 1 && (
            <Badge variant="default">Default Provider</Badge>
          )}
          <Badge variant="secondary">API Key Encrypted</Badge>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-4">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(provider)}>
              Edit
            </Button>
          )}
          {onUpdateApiKey && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateApiKey(provider)}
            >
              Update API Key
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(provider)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
