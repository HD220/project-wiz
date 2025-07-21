import { Hash } from "lucide-react";

import { Separator } from "@/renderer/components/ui/separator";

interface ContentHeaderProps {
  title?: string;
  description?: string;
}

function ContentHeader(props: ContentHeaderProps) {
  const { title = "general", description = "Welcome to your workspace" } = props;
  
  return (
    <header className="h-12 bg-background border-b flex items-center px-4">
      <div className="flex items-center gap-2">
        <Hash className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-foreground font-semibold">{title}</h1>
      </div>

      <Separator orientation="vertical" className="mx-4 h-6" />

      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

export { ContentHeader };
