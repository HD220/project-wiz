import { GitRepositoryPanel } from '@/components/git-repository-panel'
import { Trans } from "@lingui/macro";
import RepositorySettings from '@/components/repository-settings'
import { createFileRoute } from '@tanstack/react-router'

export default function RepositoriesPage() {
  return (
    <div>
      <h1>
        <Trans>Repositories</Trans>
      </h1>
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