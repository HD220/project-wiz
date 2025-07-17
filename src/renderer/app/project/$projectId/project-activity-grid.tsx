import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, CheckCircle, AlertCircle } from "lucide-react";

type ActivityItem = {
  id: string;
  type: "commit" | "message" | "task" | "agent";
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status?: "success" | "warning" | "info";
};

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "commit",
    title: "New feature implemented",
    description: "Added user authentication system",
    timestamp: "2 hours ago",
    user: "John Doe",
    status: "success",
  },
  {
    id: "2",
    type: "message",
    title: "Team discussion",
    description: "Planning meeting for next sprint",
    timestamp: "4 hours ago",
    user: "Jane Smith",
    status: "info",
  },
  {
    id: "3",
    type: "task",
    title: "Task completed",
    description: "Database migration finished",
    timestamp: "6 hours ago",
    user: "Agent Bot",
    status: "success",
  },
  {
    id: "4",
    type: "agent",
    title: "Agent Alert",
    description: "Code review needed for PR #123",
    timestamp: "8 hours ago",
    user: "Review Agent",
    status: "warning",
  },
];

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "commit":
      return <CheckCircle className="h-4 w-4" />;
    case "message":
      return <Activity className="h-4 w-4" />;
    case "task":
      return <Clock className="h-4 w-4" />;
    case "agent":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getStatusColor(status: ActivityItem["status"]) {
  switch (status) {
    case "success":
      return "text-green-600";
    case "warning":
      return "text-yellow-600";
    case "info":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
}

export function ProjectActivityGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className={`mt-1 ${getStatusColor(activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {activity.user}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
