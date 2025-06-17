import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceholderTask } from "@/lib/placeholders";
import { Trans } from "@lingui/macro";

interface ProjectTasksTabProps {
  tasks: PlaceholderTask[] | undefined; // tasks can be undefined initially
}

export function ProjectTasksTab({ tasks }: ProjectTasksTabProps) {
  return (
    <Card>
      <CardHeader><CardTitle><Trans>Tarefas do Projeto</Trans></CardTitle></CardHeader>
      <CardContent>
        {tasks && tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map(task => (
              <li key={task.id} className="p-3 border rounded-md flex justify-between items-center hover:bg-muted/50">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.assignedTo} - <Trans>Prioridade:</Trans> {task.priority}</p>
                </div>
                <Badge variant={task.status === "Concluída" ? "default" : "outline"}
                       className={`${task.status === "Concluída" ? "bg-green-500 text-white" : ""}`}>
                  {task.status}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground"><Trans>Nenhuma tarefa definida para este projeto.</Trans></p>
        )}
      </CardContent>
      <CardFooter>
          <Button variant="outline" onClick={() => console.warn("TODO: Implement Adicionar Tarefa action")}><Trans>Adicionar Tarefa</Trans></Button>
      </CardFooter>
    </Card>
  );
}
