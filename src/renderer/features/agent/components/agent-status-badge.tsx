import { Badge } from "@/renderer/components/ui/badge";
import type { AgentStatus } from "@/renderer/features/agent/agent.types";
import { cn } from "@/renderer/lib/utils";

interface AgentStatusBadgeProps {
  status: AgentStatus;
  className?: string;
}

function AgentStatusBadge(props: AgentStatusBadgeProps) {
  const { status, className } = props;

  const statusConfig = {
    active: {
      label: "Active",
      variant: "default" as const,
      className:
        "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20",
    },
    inactive: {
      label: "Inactive",
      variant: "secondary" as const,
      className:
        "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-gray-500/20",
    },
    busy: {
      label: "Busy",
      variant: "outline" as const,
      className:
        "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export { AgentStatusBadge };
