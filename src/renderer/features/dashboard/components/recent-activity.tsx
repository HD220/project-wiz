import { Activity } from "lucide-react";

import { ActivityItem } from "@/renderer/components/app/activity-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Your latest interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <ActivityItem
          icon={<div className="w-2 h-2 bg-green-500 rounded-full" />}
          title="Successfully logged into Project Wiz"
          timestamp="Just now"
          variant="success"
        />
        <ActivityItem
          icon={<div className="w-2 h-2 bg-primary rounded-full" />}
          title="Welcome! Your workspace is ready"
          timestamp="Today"
          variant="info"
        />
        <ActivityItem
          icon={<div className="w-2 h-2 bg-blue-500 rounded-full" />}
          title="System updated with latest AI models"
          timestamp="Yesterday"
          variant="info"
        />
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            Create agents and projects to see more activity
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
