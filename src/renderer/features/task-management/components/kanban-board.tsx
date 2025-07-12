import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Clock, AlertCircle } from "lucide-react";
import {
  Task,
  taskColumns,
  getTasksByStatus,
} from "@/renderer/lib/placeholders";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  projectId?: string;
  className?: string;
}

const getDaysUntilDue = (dueDate?: Date) => {
  if (!dueDate) return null;
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
};

export function KanbanBoard({ projectId, className }: KanbanBoardProps) {
  const handleCreateTask = (columnId: string) => {
    // TODO: Implement task creation
    console.log("Creating task for column:", columnId);
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className={cn("p-6 space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {taskColumns.map((column) => {
            const tasks = getTasksByStatus(column.id);

            return (
              <div key={column.id} className="flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", column.color)} />
                    <h3 className="font-semibold text-foreground">
                      {column.name}
                    </h3>
                    <Badge variant="secondary" className="ml-auto">
                      {tasks.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => handleCreateTask(column.id)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}

                  {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nenhuma tarefa em {column.name.toLowerCase()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleCreateTask(column.id)}
                      >
                        Adicionar tarefa
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon =
    daysUntilDue !== null && daysUntilDue <= 2 && daysUntilDue >= 0;

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleTaskClick = () => {
    // TODO: Open task details modal or navigate to task page
    console.log("Opening task:", task.id);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={handleTaskClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
            {task.title}
          </CardTitle>
          <Badge
            variant={getPriorityColor(task.priority)}
            className="text-xs shrink-0"
          >
            {task.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.slice(0, 3).map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="text-xs px-1.5 py-0.5"
              >
                {label}
              </Badge>
            ))}
            {task.labels.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{task.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Due date and time estimation */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  isOverdue && "text-destructive",
                  isDueSoon && "text-yellow-600",
                )}
              >
                {(isOverdue || isDueSoon) && (
                  <AlertCircle className="w-3 h-3" />
                )}
                <Clock className="w-3 h-3" />
                <span>
                  {isOverdue
                    ? `Atrasado ${Math.abs(daysUntilDue!)} dias`
                    : isDueSoon
                      ? `${daysUntilDue} dias restantes`
                      : new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        }).format(task.dueDate)}
                </span>
              </div>
            )}
          </div>

          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <span>{task.estimatedHours}h</span>
              {task.actualHours && (
                <span className="text-muted-foreground/60">
                  / {task.actualHours}h
                </span>
              )}
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assigneeId && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={task.assigneeAvatar} />
                <AvatarFallback className="text-xs">
                  {task.assigneeAvatar ||
                    task.assigneeName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {task.assigneeName}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
