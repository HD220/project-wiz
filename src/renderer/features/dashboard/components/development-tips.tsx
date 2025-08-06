import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/molecules/card";

export function DevelopmentTips() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Development Tips</CardTitle>
        <CardDescription className="text-sm">
          Best practices for AI-powered development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-lg border bg-card">
          <h4 className="text-sm font-medium mb-2">Start Small</h4>
          <p className="text-xs text-muted-foreground">
            Begin with simple agents and gradually increase complexity
            as you learn the platform.
          </p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <h4 className="text-sm font-medium mb-2">Iterate Often</h4>
          <p className="text-xs text-muted-foreground">
            Test your agents frequently and refine their prompts based
            on real-world usage.
          </p>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <h4 className="text-sm font-medium mb-2">Stay Organized</h4>
          <p className="text-xs text-muted-foreground">
            Use projects to group related work and keep your workspace
            clean.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
