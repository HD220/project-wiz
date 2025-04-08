import Documentation from '@/components/documentation'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/documentation/')({
  component: Index,
})

function Index() {
  return (
    <Documentation />
  )
}