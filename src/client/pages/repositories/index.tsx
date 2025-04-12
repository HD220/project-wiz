import { GitRepositoryPanel } from '@/components/git-repository-panel'

import RepositorySettings from '@/components/repository-settings'
import { createFileRoute } from '@tanstack/react-router'

export default function RepositoriesPage() {
  return (
    <div>
      <h1>Repositories</h1>
      <GitRepositoryPanel />
    </div>
  );
}

export const Route = createFileRoute('/repositories/')({
  component: Index,
})

function Index() {
  return (
    <RepositorySettings />
  )
}