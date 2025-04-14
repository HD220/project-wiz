import Documentation from '@/components/documentation'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/documentation/')({
  component: DocumentationPage,
})

function DocumentationPage() {
  return (
    <Documentation />
  )
}