import React from "react";

import { cn } from "@/ui/lib/utils";

export const InfoItem = ({
  icon: itemIcon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
  className?: string;
}) => {
  const IconComponent = itemIcon;
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center mb-0.5">
        <IconComponent className="h-3.5 w-3.5 mr-1.5 text-slate-400 dark:text-slate-500" />{" "}
        {label}
      </h4>
      <p
        className={cn("text-sm text-slate-700 dark:text-slate-200", className)}
      >
        {value !== undefined ? value : "N/D"}
      </p>
    </div>
  );
};
