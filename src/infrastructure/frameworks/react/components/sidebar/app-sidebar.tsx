import { Link, ToOptions, useMatchRoute } from "@tanstack/react-router";
import { Plus, Home, Archive } from "lucide-react";
import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { VariantProps } from "class-variance-authority";

export type Project = {
  name: string;
  tooltip?: string;
  icon?: ReactNode;
};

const projects: Project[] = [
  {
    name: "Projeto 1",
  },
  {
    name: "Projeto 2",
  },
  {
    name: "Projeto 3",
  },
  {
    name: "Projeto 4",
  },
  {
    name: "Projeto 5",
  },
  {
    name: "Projeto 6",
  },
  {
    name: "Projeto 7",
  },
  {
    name: "Projeto 8",
  },
  {
    name: "Projeto 9",
  },
  {
    name: "Projeto 10",
  },
  {
    name: "Projeto 11",
  },
  {
    name: "Projeto 12",
  },
  {
    name: "Projeto 13",
  },
];

export function MenuItem({
  children,
  tooltip,
  exact = false,
  asChild,
  variant = "default",
  size = "default",
  ...linkOptions
}: {
  children: ReactNode;
  tooltip: string;
  exact?: boolean;
  asChild?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
} & ToOptions) {
  const matched = useMatchRoute();
  const isActive = matched({ ...linkOptions, fuzzy: !exact });
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {asChild ? (
            children
          ) : (
            <Button
              asChild
              variant={isActive !== false ? "default" : variant}
              size={size}
              className={cn(
                "h-12 w-12 rounded-2xl",
                isActive && "border-2 border-primary-foreground"
              )}
            >
              <Link {...linkOptions}>{children}</Link>
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AppSidebar() {
  return (
    <div className="flex w-16 flex-col items-center gap-2 p-2 bg-slate-950/50 h-screen overflow-hidden shrink-0">
      <MenuItem
        tooltip="Início"
        to="/onbording"
        // mask={{ to: "/general" }}
        variant={"outline"}
      >
        <Home className="h-6 w-6" />
        <span className="sr-only">Project Wiz</span>
      </MenuItem>
      <Separator className="my-1" />
      <MenuItem tooltip="Adicionar Projecto" asChild>
        <Button
          className="h-12 w-12 rounded-2xl"
          onClick={() => alert("abc")}
          variant={"secondary"}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Adicionar Projeto</span>
        </Button>
      </MenuItem>
      <MenuItem tooltip="Ver Arquivados" asChild>
        <Button
          className="h-12 w-12 rounded-2xl"
          onClick={() => alert("abc")}
          variant={"secondary"}
        >
          <Archive className="h-6 w-6" />
          <span className="sr-only">Arquivados</span>
        </Button>
      </MenuItem>
      <Separator className="my-1" />
      <div className="flex-1 overflow-hidden gap-2 mx-auto">
        <ScrollArea className="h-full scrollbar-hide">
          <div className="flex flex-col gap-2">
            {projects.map((project, idx) => (
              <MenuItem
                key={idx}
                tooltip={project.tooltip || project.name}
                to={`/project/$id`}
                // exact={false}
                params={{ id: `${idx}` }}
                variant={"outline"}
              >
                <span>{project.name.substring(0, 2).toUpperCase()}</span>
                <span className="sr-only">{project.name}</span>
              </MenuItem>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
