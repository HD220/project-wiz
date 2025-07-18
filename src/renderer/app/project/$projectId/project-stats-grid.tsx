import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  GitCommit,
  Bot,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: {
    value: number;
    max: number;
  };
}

export function ProjectStatsGrid() {
  const stats: StatCard[] = [
    {
      title: "Tasks Completed",
      value: 23,
      description: "out of 35 total",
      icon: <CheckCircle className="h-4 w-4" />,
      trend: { value: 12, isPositive: true },
      progress: { value: 23, max: 35 },
    },
    {
      title: "Active Members",
      value: 8,
      description: "working on project",
      icon: <Users className="h-4 w-4" />,
      trend: { value: 2, isPositive: true },
    },
    {
      title: "Messages Today",
      value: 47,
      description: "team communications",
      icon: <MessageSquare className="h-4 w-4" />,
      trend: { value: 15, isPositive: true },
    },
    {
      title: "Recent Commits",
      value: 12,
      description: "in the last week",
      icon: <GitCommit className="h-4 w-4" />,
      trend: { value: 3, isPositive: false },
    },
    {
      title: "Active Agents",
      value: 3,
      description: "AI assistants working",
      icon: <Bot className="h-4 w-4" />,
    },
    {
      title: "Pending Tasks",
      value: 12,
      description: "need attention",
      icon: <Clock className="h-4 w-4" />,
      trend: { value: 2, isPositive: false },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="text-muted-foreground">{stat.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mb-2">
              {stat.description}
            </p>

            {stat.progress && (
              <div className="space-y-1">
                <Progress
                  value={(stat.progress.value / stat.progress.max) * 100}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round((stat.progress.value / stat.progress.max) * 100)}%
                  complete
                </p>
              </div>
            )}

            {stat.trend && (
              <div className="flex items-center mt-2">
                {stat.trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span
                  className={`text-xs ${
                    stat.trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend.isPositive ? "+" : "-"}
                  {Math.abs(stat.trend.value)} from last week
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
