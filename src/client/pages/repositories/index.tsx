import { GitRepositoryPanel } from "../components/git-repository-panel";

import Dashboard from '@/components/dashboard'

export default function RepositoriesPage() {
  return (
    <div>
      <h1>Repositories</h1>
      <GitRepositoryPanel />
    </div>
  );
}

import RepositorySettings from '@/components/repository-settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/repositories/')({
  component: Index,
})

function Index() {
  return (
    <RepositorySettings />
  )
}