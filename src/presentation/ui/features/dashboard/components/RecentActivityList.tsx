import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RecentActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
}

interface RecentActivityListProps {
  activities: RecentActivityItem[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            O que aconteceu recentemente na sua fábrica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={activity.avatar}
                  alt={`Avatar de ${activity.user}`}
                />
                <AvatarFallback>
                  {activity.user.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma atividade recente.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
