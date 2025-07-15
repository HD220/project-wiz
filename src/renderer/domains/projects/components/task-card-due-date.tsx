import { Clock, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface TaskCardDueDateProps {
  dueDate: Date;
  daysUntilDue: number | null;
  isOverdue: boolean;
  isDueSoon: boolean;
}

export function TaskCardDueDate({ 
  dueDate, 
  daysUntilDue, 
  isOverdue, 
  isDueSoon 
}: TaskCardDueDateProps) {
  return (
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
              }).format(dueDate)}
      </span>
    </div>
  );
}