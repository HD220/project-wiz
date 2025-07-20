import { LlmProviderForm } from "@/components/llm-provider-form";
import { LlmProviderList } from "@/components/llm-provider-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// TODO: Replace with actual user ID from auth context
const CURRENT_USER_ID = "current-user";

export default function LlmProvidersPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">LLM Providers</h1>
          <p className="text-muted-foreground">
            Configure your AI model providers for use with agents
          </p>
        </div>

        {/* Provider Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <LlmProviderForm userId={CURRENT_USER_ID} />
          </CardContent>
        </Card>

        <Separator />

        {/* Providers List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Providers</h2>
          <LlmProviderList userId={CURRENT_USER_ID} />
        </div>
      </div>
    </div>
  );
}
