import { ReactNode } from "react";

import { cn } from "@/renderer/lib/utils";

interface ActivityItemProps {
  icon: ReactNode;
  title: string;
  timestamp: string;
  variant?: "success" | "info" | "warning";
  className?: string;
}

function ActivityItem(props: ActivityItemProps) {
  const { icon, title, timestamp, variant = "info", className } = props;
  
  const variantStyles = {
    success: "text-green-500",
    info: "text-primary",
    warning: "text-yellow-500",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("w-2 h-2 rounded-full", variantStyles[variant])}>
        {icon}
      </div>
      <span className="text-sm text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground ml-auto">{timestamp}</span>
    </div>
  );
}

export { ActivityItem };
