import { Link, LinkProps } from "@tanstack/react-router";
import {
  Home,
  PlusCircle,
  Archive,
  Briefcase,
  Settings,
  LogOut,
  LucideIcon,
} from "lucide-react";
import React from "react";

// Added Avatar components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Added buttonVariants
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/ui/lib/utils";

// Interface para os itens da AppSidebar, focada em ícones e tooltips
interface AppSidebarItemProps extends Omit<LinkProps, "children" | "title"> {
  tooltip: string;
  icon: LucideIcon;
  // Para itens de projeto que podem usar Avatar
  isAvatar?: boolean;
  avatarSrc?: string;
  // Obrigatório para consistência
  avatarFallback: string;
  // Para botões que não são links
  action?: () => void;
  className?: string;
}

function AppSidebarItem({
  tooltip,
  icon: iconProp,
  isAvatar = false,
  avatarSrc,
  avatarFallback,
  action,
  className,
  ...linkProps
}: AppSidebarItemProps) {
  // Alias for JSX
  const IconComponent = iconProp;
  const content = isAvatar ? (
    <Avatar className="h-9 w-9 text-sm">
      {avatarSrc && <AvatarImage src={avatarSrc} alt={tooltip} />}
      <AvatarFallback className="bg-slate-700 text-slate-200 dark:bg-slate-600 dark:text-slate-100">
        {avatarFallback}
      </AvatarFallback>
    </Avatar>
  ) : (
    <IconComponent className="h-6 w-6" />
  );

  const commonButtonClasses = cn(
    // Usar 'ghost' para melhor adaptação à sidebar fina
    buttonVariants({ variant: "ghost", size: "icon" }),
    // Estilo base
    "h-12 w-12 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700",
    // Permite override de classes
    className
  );

  // Estilo para link ativo
  const activeLinkClasses = "!bg-sky-600 text-white dark:!bg-sky-500";

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {action ? (
            <Button
              onClick={action}
              className={commonButtonClasses}
              aria-label={tooltip}
            >
              {content}
            </Button>
          ) : (
            <Link
              {...linkProps}
              className={cn(commonButtonClasses)}
              activeProps={{ className: activeLinkClasses }}
              aria-label={tooltip}
            >
              {content}
            </Link>
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Mock data para projetos, simulando o que viria do estado/API
const mockUserProjects = [
  {
    id: "1",
    name: "Projeto Phoenix",
    initials: "PH",
    iconUrl: "/avatars/project-phoenix.png",
  },
  { id: "2", name: "Operação Quimera", initials: "OQ" },
  {
    id: "3",
    name: "Iniciativa Netuno",
    initials: "IN",
    iconUrl: "/avatars/project-neptune.png",
  },
  { id: "4", name: "Legado Moderno", initials: "LM" },
];

export function AppSidebar() {
  // Rota para onde o botão "Home" levará, ajustado para /user/
  const userHomeRoute = "/app/user";

  return (
    <aside className="w-16 flex-shrink-0 h-screen flex flex-col items-center gap-2 py-3 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Botão Inicial/Home */}
      <AppSidebarItem
        // Tooltip atualizado
        to={userHomeRoute}
        tooltip="Área do Usuário / DMs"
        icon={Home}
        avatarFallback="U"
      />

      <Separator className="my-1 w-3/4" />

      {/* Ações Principais */}
      <AppSidebarItem
        tooltip="Adicionar Novo Projeto"
        icon={PlusCircle}
        // Link direto para a página de novo projeto
        to="/app/projects/new"
        // Não usado
        avatarFallback="+"
      />
      <AppSidebarItem
        tooltip="Projetos Arquivados"
        icon={Archive}
        // Rota placeholder
        to="/app/projects/archived"
        // Não usado
        avatarFallback="A"
      />

      <Separator className="my-1 w-3/4" />

      {/* Lista de Projetos Ativos */}
      <ScrollArea className="flex-1 w-full overflow-y-auto">
        <div className="flex flex-col items-center gap-2 px-2">
          {mockUserProjects.map((project) => (
            <AppSidebarItem
              key={project.id}
              to="/app/projects/$projectId"
              params={{ projectId: project.id }}
              tooltip={project.name}
              // Ícone padrão se não for avatar
              icon={Briefcase}
              // Usar Avatar para projetos
              isAvatar={true}
              avatarSrc={project.iconUrl}
              avatarFallback={project.initials}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator className="my-1 w-3/4" />

      {/* Ações no Rodapé */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <AppSidebarItem
          to="/app/settings"
          tooltip="Configurações"
          icon={Settings}
          // Não usado
          avatarFallback="S"
        />
        <AppSidebarItem
          tooltip="Sair (Logout)"
          icon={LogOut}
          // Ação simulada
          action={() => {
            console.log("Logout action triggered (simulated)");
            alert("Logout (simulado)");
          }}
          // Não usado
          avatarFallback="L"
        />
      </div>
    </aside>
  );
}

export default AppSidebar;
