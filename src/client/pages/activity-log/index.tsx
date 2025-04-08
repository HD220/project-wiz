import ActivityLog from '@/components/activity-log'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/activity-log/')({
  component: Index,
})

function Index() {
  return (
    <ActivityLog />
  )
}