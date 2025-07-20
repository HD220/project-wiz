import { Star, Link, CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LlmProvider {
  id: string;
  userId: string;
  name: string;
  type: "openai" | "deepseek" | "anthropic";
  apiKey: string;
  baseUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LlmProviderCardProps {
  provider: LlmProvider;
}

export function LlmProviderCard({ provider }: LlmProviderCardProps) {
  return (
    <Card
      className={`transition-colors ${provider.isDefault ? "border-primary bg-primary/5" : ""}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{provider.name}</CardTitle>
            {provider.isDefault && (
              <Star className="h-4 w-4 fill-primary text-primary" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={provider.isActive ? "default" : "secondary"}>
              {provider.type}
            </Badge>
            {provider.isActive ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <CardDescription>
          {provider.isDefault && "Default Provider"}
          {!provider.isDefault && provider.isActive && "Available"}
          {!provider.isActive && "Inactive"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>API Key:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">••••••••</code>
          </div>
          {provider.baseUrl && (
            <div className="flex items-center gap-2">
              <Link className="h-3 w-3" />
              <span>Custom endpoint configured</span>
            </div>
          )}
          <div className="text-xs pt-2">
            Created: {new Date(provider.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
