import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NavigationHeaderProps {
  projectName: string;
}

export function NavigationHeader({ projectName }: NavigationHeaderProps) {
  return (
    <div className="h-12 px-3 flex items-center justify-between border-b border-border shadow-sm flex-none">
      <h2 className="font-semibold text-foreground truncate">
        {projectName}
      </h2>
      <Button variant="ghost" size="icon" className="w-6 h-6">
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
