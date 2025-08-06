import { Bot, Folder, MessageSquare, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/molecules/card";

export function QuickStats() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <CardTitle className="text-base">Workspace Stats</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
          <div className="flex items-center gap-2">
            <Bot className="size-3 text-primary" />
            <span className="text-sm">AI Agents</span>
          </div>
          <span className="text-sm font-medium">0</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
          <div className="flex items-center gap-2">
            <Folder className="size-3 text-blue-600" />
            <span className="text-sm">Projects</span>
          </div>
          <span className="text-sm font-medium">0</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-3 text-green-600" />
            <span className="text-sm">Conversations</span>
          </div>
          <span className="text-sm font-medium">0</span>
        </div>
      </CardContent>
    </Card>
  );
}
