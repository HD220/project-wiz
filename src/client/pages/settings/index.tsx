import RepositorySettings from '@/components/repository-settings'
import GitHubTokenManager from '@/components/github-token-manager'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/')({
  component: Index,
})

function Index() {
  return (
    <div className="space-y-6 p-4">
      <GitHubTokenManager />
      <RepositorySettings />
    </div>
  )
}