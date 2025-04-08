import Dashboard from '@/components/dashboard'
import RepositorySettings from '@/components/repository-settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings/')({
  component: Index,
})

function Index() {
  return (
    <RepositorySettings />
  )
}