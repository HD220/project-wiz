import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGitHubTokenManager } from '@/hooks/use-github-token-manager';
import { i18n } from '../i18n';

const GitHubTokenManager: React.FC = () => {
  const {
    token,
    isTokenSaved,
    loading,
    onTokenChange,
    onSave,
    onRemove,
  } = useGitHubTokenManager();

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h2 className="text-lg font-semibold">
        {i18n._('githubTokenManager.title')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {i18n._('githubTokenManager.description')}
      </p>
      <div className="flex items-center space-x-2">
        <Input
          placeholder={i18n._('githubTokenManager.placeholder')}
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          disabled={loading}
        />
        <Button onClick={onSave} disabled={loading || !token}>
          {i18n._('githubTokenManager.save')}
        </Button>
        <Button
          variant="outline"
          onClick={onRemove}
          disabled={loading || !isTokenSaved}
        >
          {i18n._('githubTokenManager.remove')}
        </Button>
      </div>
      <div>
        {i18n._('githubTokenManager.status')}{' '}
        {isTokenSaved ? (
          <Badge variant="default">
            {i18n._('githubTokenManager.tokenSaved')}
          </Badge>
        ) : (
          <Badge variant="secondary">
            {i18n._('githubTokenManager.noTokenSaved')}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default GitHubTokenManager;