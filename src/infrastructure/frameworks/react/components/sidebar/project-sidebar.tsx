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
import { ScrollArea } from "../ui/scroll-area";
import { Link } from "@tanstack/react-router";
import { placeholderProjectNavItems, placeholderProjectChannels, ProjectNavItemPlaceholder, ProjectChannelPlaceholder } from "@/lib/placeholders";
import { H4 } from "../typography/titles";
import { Trans, t } from "@lingui/macro";
import { i18n } from "@lingui/core";
import {
  Calendar,
  ChevronDown,
  Home,
  Inbox,
  Plus,
  Search,
  Settings,
  LucideIcon, // LucideIcon is a type
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";


export function ProjectSidebar({ projectName = i18n._("projectSidebar.defaultProjectName", "Nome do Projeto Placeholder") }: { projectName?: string }) {
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
            <SidebarGroupLabel><Trans>Canais</Trans></SidebarGroupLabel>
            <SidebarGroupAction title={t`Nova Mensagem`}>
              <Plus onClick={() => console.warn("TODO: Implement Novo Canal action")} /> <span className="sr-only"><Trans>Novo Canal</Trans></span>
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
                          <SidebarMenuButton asChild>
                            {/* TODO: Define actual route for channel pages */}
                            <Link to="#" title={t({ id: "projectSidebar.navigateToChannel", message: `Ir para canal ${channel.name}`, values: { channelName: channel.name }})}>
                              <div className="flex flex-1 justify-start items-center">
                                <span> # {`${channel.name}`}</span>
                              </div>
                            </Link>
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
