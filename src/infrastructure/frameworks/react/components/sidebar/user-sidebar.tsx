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
import { Plus } from "lucide-react"; // Keep Plus if used for "New Message"
// Removed Calendar, Home, Inbox, Search, Settings from here as they'll be imported below for the map
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"; // Avatar imports are used by DirectMessageListItem, not directly here after refactor
import { cn, getInitials } from "@/lib/utils"; // getInitials is used by DirectMessageListItem
import { ScrollArea } from "../ui/scroll-area";
import { Link } from "@tanstack/react-router";
import { placeholderUserSidebarNavItems, placeholderUserListForDM, placeholderDirectMessageThreads, UserSidebarNavItemPlaceholder } from "@/lib/placeholders";
import { DirectMessageListItem } from "./direct-message-list-item";
import { Home, Inbox, Calendar, Search, Settings, LucideIcon } from "lucide-react"; // Explicit imports for iconMap
import { H4 } from "../typography/titles";
import { Trans, t } from "@lingui/macro";
import { i18n } from "@lingui/core";
import { useSyncedCurrentUser } from "@/hooks/useSyncedCurrentUser";

export function UserSidebar() {
  const currentUser = useSyncedCurrentUser();
  // Assuming UserQueryOutput is UserDTO[] and we need the first user, or it's UserDTO directly
  // Based on user-data-store, currentUserSnapshot is UserQueryOutput | null.
  // If UserQueryOutput is UserDTO[], then currentUser here would be UserDTO[] | null.
  // And currentUser[0]?.nickname would be needed.
  // However, userQuery in use-core returns a single UserDTO.
  // And handleUserDataChanged in store sets currentUserSnapshot = newData (which is UserQueryOutput).
  // Let's assume UserQueryOutput from the store is effectively a single user object or null.
  // If UserQueryOutput from core is UserDTO[], the store or preload should handle picking the first element.
  // For now, proceeding as if currentUser is { nickname: string } | null.
  const displayName = currentUser?.nickname || i18n._("userSidebar.loadingOrNoUser", "Usuário");

  const iconMap: Record<UserSidebarNavItemPlaceholder["iconName"], LucideIcon> = {
    Home: Home,
    Inbox: Inbox,
    Calendar: Calendar,
    Search: Search,
    Settings: Settings,
  };

  return (
    <Sidebar
      collapsible="none"
      className="!relative [&>[data-slot=sidebar-container]]:relative flex flex-1 w-full"
    >
      <SidebarHeader>
        <H4 className=" truncate">{displayName}</H4>
        <SidebarSeparator className="mx-0 px-0" />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full ">
          {/* <div className="flex flex-col gap-2"> */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {placeholderUserSidebarNavItems.map((item) => {
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
            <SidebarGroupLabel><Trans>Mensagens Diretas</Trans></SidebarGroupLabel>
            <SidebarGroupAction title={t`Nova Mensagem`}>
              <Plus onClick={() => console.warn("TODO: Implement Nova Mensagem (DM) action")} /> <span className="sr-only"><Trans>Nova Mensagem</Trans></span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {placeholderDirectMessageThreads.map((dmThread) => (
                  <DirectMessageListItem key={dmThread.id} dmThread={dmThread} users={placeholderUserListForDM} />
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
