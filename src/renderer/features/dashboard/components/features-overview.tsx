import { Clock, Shield, Target } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";

export function FeaturesOverview() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Key Features</CardTitle>
        <CardDescription className="text-sm">
          Built for developers, by developers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
            <div className="p-1 rounded-sm bg-primary/10 mt-0.5">
              <Clock className="size-3 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Save Time</h4>
              <p className="text-xs text-muted-foreground">
                Automate repetitive tasks
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
            <div className="p-1 rounded-sm bg-blue-500/10 mt-0.5">
              <Shield className="size-3 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Secure</h4>
              <p className="text-xs text-muted-foreground">
                Enterprise-grade security
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
            <div className="p-1 rounded-sm bg-green-500/10 mt-0.5">
              <Target className="size-3 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Precise</h4>
              <p className="text-xs text-muted-foreground">
                AI trained for development
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
