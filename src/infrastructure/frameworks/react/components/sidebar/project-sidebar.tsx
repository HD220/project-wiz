import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Calendar,
  ChevronDown,
  Home,
  Inbox,
  Plus,
  Search,
  ChevronDown,
  Plus,
  // Lucide Icons for the map will be imported explicitly now
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Link } from "@tanstack/react-router";
import { placeholderProjectNavItems, placeholderProjectChannels, ProjectNavItemPlaceholder, ProjectChannelPlaceholder } from "@/lib/placeholders";
import { Home, Inbox, Calendar, Search, Settings, LucideIcon } from "lucide-react"; // Explicit imports for iconMap
import { H4 } from "../typography/titles";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

// .map(([category, channels])=>({category, channels}))

export function ProjectSidebar({ projectName = "Nome do Projeto Placeholder" }: { projectName?: string }) {
  const iconMap: Record<ProjectNavItemPlaceholder["iconName"], LucideIcon> = {
    Home: Home,
    Inbox: Inbox,
    Calendar: Calendar,
    Search: Search,
    Settings: Settings,
  };
  const agrupedChannels = Object.entries(
    Object.groupBy(placeholderProjectChannels, ({ category }: ProjectChannelPlaceholder) => category)
  );
  return (
    <Sidebar
      collapsible="none"
      className="!relative [&>[data-slot=sidebar-container]]:relative flex flex-1 w-full "
    >
      <SidebarHeader className="">
        <H4 className=" truncate">{projectName}</H4>
        <SidebarSeparator className="mx-0 px-0" />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full ">
          {/* <div className="flex flex-col gap-2"> */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {placeholderProjectNavItems.map((item) => {
                  const IconComponent = iconMap[item.iconName];
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.url}
                          activeProps={{ className: "bg-muted" }}
                          activeOptions={{ exact: true }}
                        >
                          <IconComponent className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Canais</SidebarGroupLabel>
            <SidebarGroupAction title="Nova Mensagem">
              <Plus /> <span className="sr-only">Novo Canal</span>
            </SidebarGroupAction>
          </SidebarGroup>
          {agrupedChannels.map(([categoryName, channels]) => (
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger>
                    {categoryName}
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                      {channels?.map((channel: ProjectChannelPlaceholder) => (
                        <SidebarMenuItem key={channel.id}>
                          <SidebarMenuButton>
                            <div className="flex flex-1 justify-start items-center">
                              <span> # {`${channel.name}`}</span>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}
        </ScrollArea>
      </SidebarContent>
      {/* <SidebarFooter className=""></SidebarFooter> */}
    </Sidebar>
  );
}
