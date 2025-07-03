import { Activity } from "lucide-react";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AgentActivityLogCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" /> Logs de Atividade Recente
        </CardTitle>
        <CardDescription>
          Eventos e ações realizadas por esta instância de agente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          (Placeholder: Lista de logs de atividade do agente, como início/fim de
          jobs, ferramentas usadas, erros, etc.)
        </p>
        <ul className="mt-3 space-y-2 text-xs">
          <li className="flex items-start">
            <span className="font-mono text-slate-500 dark:text-slate-400 mr-2">
              [10:35:02]
            </span>{" "}
            Job &apos;task-abc-123&apos; iniciado.
          </li>
          <li className="flex items-start">
            <span className="font-mono text-slate-500 dark:text-slate-400 mr-2">
              [10:35:05]
            </span>{" "}
            Ferramenta &apos;filesystem.readFile&apos; executada com sucesso.
          </li>
          <li className="flex items-start">
            <span className="font-mono text-red-500 dark:text-red-400 mr-2">
              [10:36:12]
            </span>{" "}
            Erro ao processar &apos;subtask-xyz&apos;: Timeout.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
