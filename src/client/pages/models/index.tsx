import ModelSettings from '@/components/model-settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/models/')({
  component: Index,
})

function Index() {
  return (
    <ModelSettings />
  )
}