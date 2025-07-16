import { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card-core";

interface StatsCardProps {
  title: string;
  value: number;
  Icon: LucideIcon;
  className?: string;
}

export function StatsCard({ title, value, Icon, className }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className || ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
