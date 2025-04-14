import ModelSettings from '@/components/model-settings'
import { createFileRoute } from '@tanstack/react-router'
import LlmSessionControl from '@/components/llm-session-control'

export const Route = createFileRoute('/models/')({
  component: ModelsPage,
})

function ModelsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <LlmSessionControl />
      <ModelSettings />
    </div>
  )
}