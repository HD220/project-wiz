import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

declare global {
  interface Window {
    githubTokenAPI: {
      saveGitHubToken(token: string): Promise<void>;
      removeGitHubToken(): Promise<void>;
      getGitHubTokenStatus(): Promise<boolean>;
    };
  }
}

const GitHubTokenManager: React.FC = () => {
  const [token, setToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const status = await window.githubTokenAPI.getGitHubTokenStatus();
      setIsSaved(status);
    } catch {
      toast.error('Erro ao verificar status do token');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const validateToken = (token: string) => {
    return token.startsWith('ghp_');
  };

  const handleSave = async () => {
    if (!validateToken(token)) {
      toast.error('Token inválido. Deve começar com "ghp_".');
      return;
    }
    setLoading(true);
    try {
      await window.githubTokenAPI.saveGitHubToken(token);
      toast.success('Token salvo com sucesso.');
      setToken('');
      fetchStatus();
    } catch {
      toast.error('Erro ao salvar o token.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await window.githubTokenAPI.removeGitHubToken();
      toast.success('Token removido com sucesso.');
      fetchStatus();
    } catch {
      toast.error('Erro ao remover o token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h2 className="text-lg font-semibold">Token de Acesso Pessoal do GitHub</h2>
      <p className="text-sm text-muted-foreground">
        O token é armazenado localmente e pode ser removido a qualquer momento.
      </p>
      <div className="flex items-center space-x-2">
        <Input
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxx"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleSave} disabled={loading || !token}>
          Salvar
        </Button>
        <Button variant="outline" onClick={handleRemove} disabled={loading || !isSaved}>
          Remover
        </Button>
      </div>
      <div>
        Status:{' '}
        {isSaved ? (
          <Badge variant="default">Token salvo</Badge>
        ) : (
          <Badge variant="secondary">Nenhum token salvo</Badge>
        )}
      </div>
    </div>
  );
};

export default GitHubTokenManager;