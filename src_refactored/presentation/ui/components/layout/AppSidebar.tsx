import { Link, LinkProps } from '@tanstack/react-router';
import { Home, PlusCircle, Archive, Briefcase, Settings, LogOut, LucideIcon } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar'; // Added Avatar components
import { Button, buttonVariants } from '@/presentation/ui/components/ui/button'; // Added buttonVariants
import { ScrollArea } from '@/presentation/ui/components/ui/scroll-area';
import { Separator } from '@/presentation/ui/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/ui/components/ui/tooltip';
import { cn } from '@/presentation/ui/lib/utils';

// Interface para os itens da AppSidebar, focada em ícones e tooltips
interface AppSidebarItemProps extends Omit<LinkProps, 'children' | 'title'> {
  tooltip: string;
  icon: LucideIcon;
  isAvatar?: boolean; // Para itens de projeto que podem usar Avatar
  avatarSrc?: string;
  avatarFallback: string; // Obrigatório para consistência
  action?: () => void; // Para botões que não são links
  className?: string;
}

function AppSidebarItem({
  tooltip,
  icon: Icon,
  isAvatar = false,
  avatarSrc,
  avatarFallback,
  action,
  className,
  ...linkProps // Resto das props são para o Link do TanStack Router
}: AppSidebarItemProps) {
  const content = isAvatar ? (
    <Avatar className="h-9 w-9 text-sm">
      {avatarSrc && <AvatarImage src={avatarSrc} alt={tooltip} />}
      <AvatarFallback className="bg-slate-700 text-slate-200 dark:bg-slate-600 dark:text-slate-100">
        {avatarFallback}
      </AvatarFallback>
    </Avatar>
  ) : (
    <Icon className="h-6 w-6" />
  );

  const commonButtonClasses = cn(
    buttonVariants({ variant: 'ghost', size: 'icon' }), // Usar 'ghost' para melhor adaptação à sidebar fina
    "h-12 w-12 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700", // Estilo base
    className // Permite override de classes
  );

  const activeLinkClasses = "!bg-sky-600 text-white dark:!bg-sky-500"; // Estilo para link ativo

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
  { id: '1', name: 'Projeto Phoenix', initials: 'PH', iconUrl: '/avatars/project-phoenix.png' },
  { id: '2', name: 'Operação Quimera', initials: 'OQ' },
  { id: '3', name: 'Iniciativa Netuno', initials: 'IN', iconUrl: '/avatars/project-neptune.png' },
  { id: '4', name: 'Legado Moderno', initials: 'LM' },
];


export function AppSidebar() {
  // Rota para onde o botão "Home" levará - pode ser /user/conversations ou /user/dashboard
  const userHomeRoute = '/chat'; // Ajustado para /chat como exemplo de DMs

  return (
    <aside className="w-16 flex-shrink-0 h-screen flex flex-col items-center gap-2 py-3 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Botão Inicial/Home */}
      <AppSidebarItem
        to={userHomeRoute}
        tooltip="Início / Conversas"
        icon={Home} // Pode ser um logo da aplicação também
        avatarFallback="U" // Não usado se isAvatar=false
      />

      <Separator className="my-1 w-3/4" />

      {/* Ações Principais */}
      <AppSidebarItem
        tooltip="Adicionar Novo Projeto"
        icon={PlusCircle}
        to="/projects/new" // Link direto para a página de novo projeto
        avatarFallback="+" // Não usado
      />
      <AppSidebarItem
        tooltip="Projetos Arquivados"
        icon={Archive}
        to="/projects/archived" // Rota placeholder
        avatarFallback="A" // Não usado
      />

      <Separator className="my-1 w-3/4" />

      {/* Lista de Projetos Ativos */}
      <ScrollArea className="flex-1 w-full overflow-y-auto">
        <div className="flex flex-col items-center gap-2 px-2">
          {mockUserProjects.map(project => (
            <AppSidebarItem
              key={project.id}
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              tooltip={project.name}
              icon={Briefcase} // Ícone padrão se não for avatar
              isAvatar={true} // Usar Avatar para projetos
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
            to="/settings"
            tooltip="Configurações"
            icon={Settings}
            avatarFallback="S" // Não usado
        />
        <AppSidebarItem
            tooltip="Sair (Logout)"
            icon={LogOut}
            action={() => { console.log("Logout action triggered (simulated)"); alert("Logout (simulado)"); }} // Ação simulada
            avatarFallback="L" // Não usado
        />
      </div>
    </aside>
  );
}

export default AppSidebar;
