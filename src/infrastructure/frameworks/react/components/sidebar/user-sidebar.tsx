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
import { Calendar, Home, Inbox, Plus, Search, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Link } from "@tanstack/react-router";
import { H4 } from "../typography/titles";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/user",
    icon: Home,
  },
  {
    title: "Integrações",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Guias de Uso",
    url: "/user/user-guides",
    icon: Calendar,
  },
  {
    title: "MCPs",
    url: "#",
    icon: Search,
  },
  {
    title: "Personas/Agents",
    url: "#",
    icon: Settings,
  },
  {
    title: "Configurações",
    url: "#",
    icon: Settings,
  },
];

type User = {
  id: string;
  name: string;
  status: "invisible" | "busy" | "absent" | "available";
  avatar: string;
};
const users: User[] = [
  {
    id: "1",
    name: "Nicolas",
    avatar: "",
    status: "available",
  },
  {
    id: "2",
    name: "Júlio Scremin",
    avatar: "",
    status: "available",
  },
  {
    id: "3",
    name: "Renos1",
    avatar: "",
    status: "available",
  },
];

type IndividualDM = {
  type: "individual";
  id: string;
  userId: string;
};
type GroupDM = {
  type: "group";
  id: string;
  description: string;
  participants: { userId: string }[];
};

const dms: (IndividualDM | GroupDM)[] = [
  {
    type: "individual",
    id: "1",
    userId: "2",
  },
  {
    type: "individual",
    id: "2",
    userId: "3",
  },
  {
    type: "group",
    id: "3",
    description: "Apoio Mateus",
    participants: [{ userId: "1" }, { userId: "2" }, { userId: "3" }],
  },
];

export function UserSidebar() {
  return (
    <Sidebar
      collapsible="none"
      className="!relative [&>[data-slot=sidebar-container]]:relative flex flex-1 w-full"
    >
      <SidebarHeader>
        <H4 className=" truncate">Nome do usuário</H4>
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
            <SidebarGroupLabel>Mensagens Diretas</SidebarGroupLabel>
            <SidebarGroupAction title="Nova Mensagem">
              <Plus /> <span className="sr-only">Nova Mensagem</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {[...dms].map((message) => (
                  <SidebarMenuItem key={message.id}>
                    <SidebarMenuButton
                      className="h-12 hover:bg-accent/50"
                      asChild
                    >
                      <Link
                        to={`/user/dm/$id`}
                        params={{ id: message.id }}
                        className="py-2"
                        activeOptions={{ exact: true }}
                        activeProps={{
                          className: "bg-accent",
                        }}
                      >
                        <div className="flex flex-1 gap-2 items-center">
                          <div className="w-12 h-12 relative">
                            {message.type === "individual" ? (
                              <Avatar className="size-12 border-2">
                                <AvatarImage></AvatarImage>
                                <AvatarFallback>
                                  {users
                                    .find((user) => user.id === message.userId)
                                    ?.name.split(" ")
                                    .join()
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <>
                                {message.participants
                                  .slice(0, 2)
                                  .map((member, idx) => (
                                    <Avatar
                                      key={`${idx}`}
                                      className={cn(
                                        "size-8 absolute border-2",
                                        idx % 2 == 0
                                          ? "left-0 top-0"
                                          : "right-0 bottom-0"
                                      )}
                                    >
                                      <AvatarImage></AvatarImage>
                                      <AvatarFallback>
                                        {users
                                          .find(
                                            (user) => user.id === member.userId
                                          )
                                          ?.name.split(" ")
                                          .join()
                                          .substring(0, 2)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                              </>
                            )}
                          </div>
                          <div className="flex flex-1 justify-start items-center">
                            <span>
                              {message.type === "individual"
                                ? users.find(
                                    (user) => user.id === message.userId
                                  )?.name
                                : message.description}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      {/* <SidebarFooter className=""></SidebarFooter> */}
    </Sidebar>
  );
}
