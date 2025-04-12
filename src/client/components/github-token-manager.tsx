import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useGitHubToken } from '@/hooks/use-github-token';
import { validateGitHubToken } from '@/lib/validate-github-token';
import { i18n } from '../i18n';

const GitHubTokenManager: React.FC = () => {
  const [token, setToken] = useState('');
  const [isTokenSaved, setIsTokenSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const { getGitHubTokenStatus, saveGitHubToken, removeGitHubToken } = useGitHubToken();

  const fetchGitHubTokenStatus = async () => {
    try {
      const status = await getGitHubTokenStatus();
      setIsTokenSaved(status);
    } catch {
      toast.error(i18n._('Failed to check token status.'));
    }
  };

  useEffect(() => {
    fetchGitHubTokenStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!validateGitHubToken(token)) {
      toast.error(i18n._('Invalid token. It must start with "ghp_".'));
      return;
    }
    setLoading(true);
    try {
      await saveGitHubToken(token);
      toast.success(i18n._('Token saved successfully.'));
      setToken('');
      fetchGitHubTokenStatus();
    } catch {
      toast.error(i18n._('Failed to save token.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeGitHubToken();
      toast.success(i18n._('Token removed successfully.'));
      fetchGitHubTokenStatus();
    } catch {
      toast.error(i18n._('Failed to remove token.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h2 className="text-lg font-semibold">
        {i18n._('GitHub Personal Access Token')}
      </h2>
      <p className="text-sm text-muted-foreground">
        {i18n._('The token is stored locally and can be removed at any time.')}
      </p>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxx"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleSave} disabled={loading || !token}>
          {i18n._('Save')}
        </Button>
        <Button variant="outline" onClick={handleRemove} disabled={loading || !isTokenSaved}>
          {i18n._('Remove')}
        </Button>
      </div>
      <div>
        {i18n._('Status:')}{' '}
        {isTokenSaved ? (
          <Badge variant="default">
            {i18n._('Token saved')}
          </Badge>
        ) : (
          <Badge variant="secondary">
            {i18n._('No token saved')}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default GitHubTokenManager;