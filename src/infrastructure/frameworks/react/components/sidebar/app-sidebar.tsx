import {
  Link,
  LinkComponentProps,
  LinkOptions,
  LinkProps,
  ToOptions,
  useMatchRoute,
} from "@tanstack/react-router";
import { Plus, Home, Archive, Rss } from "lucide-react";
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
import { Slot } from "@radix-ui/react-slot";
import { placeholderAppSidebarProjects, AppSidebarProjectPlaceholder } from "@/lib/placeholders";
import { Trans, t } from "@lingui/macro";
import { SystemText } from "@/components/messages/common";

export function MenuItem({
  tooltip,
  variant,
  size,
  asChild,
  className,
  ...props
}: {
  children: ReactNode;
  tooltip: string;
  asChild?: boolean;
  className?: string;
} & VariantProps<typeof buttonVariants> &
  LinkProps) {
  const Comp = asChild ? Slot : Link;
  const {
    activeOptions = { exact: false },
    activeProps = {
      className: "border-2 border-primary",
    },
    ...rest
  } = props || {};
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Comp
            className={cn(
              buttonVariants({
                variant,
                size,
                className: cn("h-12 w-12 rounded-2xl", className),
              })
            )}
            activeOptions={!asChild ? activeOptions : undefined}
            activeProps={!asChild ? activeProps : undefined}
            {...rest}
          />
        </TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AppSidebar() {
  return (
    <div className="flex w-16 flex-col items-center gap-2 bg-card/70 h-screen overflow-hidden shrink-0 pt-2">
      <MenuItem tooltip={t`Início`} to="/user" variant={"secondary"}>
        <Home className="h-6 w-6" />
        <span className="sr-only"><SystemText /></span>
      </MenuItem>
      <Separator className="my-1" />
      <MenuItem className="cursor-pointer" tooltip={t`Adicionar Projeto`} asChild>
        <Button onClick={() => console.warn("TODO: Implement Adicionar Projeto action")}>
          <Plus className="h-6 w-6" />
          <span className="sr-only"><Trans>Adicionar Projeto</Trans></span>
        </Button>
      </MenuItem>
      <MenuItem className="cursor-pointer" tooltip={t`Ver Arquivados`} asChild>
        <Button onClick={() => console.warn("TODO: Implement Ver Arquivados action")}>
          <Archive className="h-6 w-6" />
          <span className="sr-only"><Trans>Arquivados</Trans></span>
        </Button>
      </MenuItem>
      <Separator className="my-1" />
      <div className="flex-1 overflow-hidden gap-2 mx-auto">
        <ScrollArea className="h-full scrollbar-hide">
          <div className="flex flex-col gap-2 pb-2">
            {placeholderAppSidebarProjects.map((project: AppSidebarProjectPlaceholder) => (
              <MenuItem
                key={project.id}
                tooltip={project.tooltip || project.name}
                to={`/project/$id`}
                params={{ id: project.id }}
                variant={"secondary"}
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
