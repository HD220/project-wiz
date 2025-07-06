import { AlertTriangle, Zap } from "lucide-react";
import React from "react";

import type { AgentInstance } from "@/core/domain/entities/agent";

export const statusDisplayMap: Record<
  AgentInstance["status"],
  { label: string; icon: React.ElementType; colorClasses: string }
> = {
  idle: {
    label: "Ocioso",
    icon: Zap,
    colorClasses: "bg-slate-500 text-slate-50",
  },
  running: {
    label: "Executando",
    icon: Zap,
    colorClasses: "bg-sky-500 text-sky-50 animate-pulse",
  },
  paused: {
    label: "Pausado",
    icon: Zap,
    colorClasses: "bg-yellow-500 text-yellow-50",
  },
  error: {
    label: "Erro",
    icon: AlertTriangle,
    colorClasses: "bg-red-500 text-red-50",
  },
  completed: {
    label: "Concluído (Job)",
    icon: Zap,
    colorClasses: "bg-green-500 text-green-50",
  },
};
