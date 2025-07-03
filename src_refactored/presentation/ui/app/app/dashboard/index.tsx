import { createFileRoute } from "@tanstack/react-router";
import React from "react";

import { DashboardStatsCards } from "@/ui/features/dashboard/components/DashboardStatsCards";
import { RecentActivityList } from "@/ui/features/dashboard/components/RecentActivityList";

function DashboardPage() {
  const stats = {
    activeProjects: 3,
    runningAgents: 5,
    tasksCompletedToday: 12,
  };

  const recentActivities = [
    {
      id: "1",
      user: "Alice",
      action: 'iniciou um novo job em "Projeto Phoenix"',
      time: "5m atrás",
      avatar: "/avatars/01.png",
    },
    {
      id: "2",
      user: "Agente Coder",
      action: 'completou a tarefa "Refatorar API"',
      time: "15m atrás",
      avatar: "/avatars/agent.png",
    },
    {
      id: "3",
      user: "Bob",
      action: 'adicionou uma nova Persona "QA Master"',
      time: "1h atrás",
      avatar: "/avatars/02.png",
    },
  ];

  const user = {
    name: "J. Doe",
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Bem-vindo de volta, {user.name}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Aqui está um resumo da sua fábrica de software autônoma.
        </p>
      </header>

      <DashboardStatsCards stats={stats} />

      <RecentActivityList activities={recentActivities} />
    </div>
  );
}

export const Route = createFileRoute("/app/dashboard/")({
  component: DashboardPage,
});
