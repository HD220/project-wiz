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
  Settings,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Link } from "@tanstack/react-router";
import { H4 } from "../typography/titles";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/user",
    icon: Home,
  },
  {
    title: "Tarefas",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Forum",
    url: "/user/user-guides",
    icon: Calendar,
  },
  {
    title: "Documentação",
    url: "#",
    icon: Search,
  },
  {
    title: "Analytics",
    url: "#",
    icon: Settings,
  },
  {
    title: "Configurações",
    url: "#",
    icon: Settings,
  },
];

type Channel = {
  id: string;
  name: string;
  category: string;
};

const channels: Channel[] = [
  {
    id: "1",
    name: "canal 1",
    category: "categoria 1",
  },
  {
    id: "2",
    name: "canal 2",
    category: "categoria 1",
  },
  {
    id: "3",
    name: "canal 3",
    category: "categoria 1",
  },
  {
    id: "4",
    name: "canal 4",
    category: "categoria 2",
  },
  {
    id: "5",
    name: "canal 5",
    category: "categoria 2",
  },
  {
    id: "6",
    name: "canal 6",
    category: "categoria 2",
  },
  {
    id: "7",
    name: "canal 7",
    category: "categoria 3",
  },
];
const agrupedChannels = Object.entries(
  Object.groupBy(channels, ({ category }: Channel) => category)
);
// .map(([category, channels])=>({category, channels}))

export function ProjectSidebar() {
  return (
    <Sidebar
      collapsible="none"
      className="!relative [&>[data-slot=sidebar-container]]:relative flex flex-1 w-full "
    >
      <SidebarHeader className="">
        <H4 className=" truncate">Nome do projeto</H4>
        <SidebarSeparator className="mx-0 px-0" />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full ">
          {/* <div className="flex flex-col gap-2"> */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        activeProps={{ className: "bg-muted" }}
                        activeOptions={{ exact: true }}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
                      {channels?.map((channel: Channel) => (
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
