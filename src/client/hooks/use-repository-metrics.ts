import { useEffect, useState } from 'react';
import { t } from '@lingui/macro';
// import { db } from '../../core/infrastructure/db/client';
import { activityLog } from '../../core/infrastructure/db/schema';
import { eq } from 'drizzle-orm';

interface RepositoryMetric {
  label: string;
  value: number;
  progress: number;
  icon: string;
}

export function useRepositoryMetrics(): { metrics: RepositoryMetric[]; loading: boolean; error: string | null } {
  const [metrics, setMetrics] = useState<RepositoryMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);

        // TODO: Implement fetch via IPC from main process
        // Temporarily disable direct DB access
        /*
        const commitCount = await db
          .select()
          .from(activityLog)
          .where(eq(activityLog.type, 'commit'))
          .then((res: any[]) => res.length);

        const prCount = await db
          .select()
          .from(activityLog)
          .where(eq(activityLog.type, 'pull_request'))
          .then((res: any[]) => res.length);

        const issueCount = await db
          .select()
          .from(activityLog)
          .where(eq(activityLog.type, 'issue'))
          .then((res: any[]) => res.length);

        const total = commitCount + prCount + issueCount || 1;

        setMetrics([
          {
            label: t`Commits`,
            value: commitCount,
            progress: Math.min(100, Math.round((commitCount / total) * 100)),
            icon: '📈',
          },
          {
            label: t`Pull Requests`,
            value: prCount,
            progress: Math.min(100, Math.round((prCount / total) * 100)),
            icon: '🔀',
          },
          {
            label: t`Issues`,
            value: issueCount,
            progress: Math.min(100, Math.round((issueCount / total) * 100)),
            icon: '🐞',
          },
        ]);
        */
        setMetrics([]);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching repository metrics', err);
        setError(t`Failed to load metrics`);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}