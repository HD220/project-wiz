import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils"; // Assuming getInitials is here
import { UserPlaceholder, DirectMessageThreadPlaceholder } from "@/lib/placeholders";
import { t } from "@lingui/macro";

interface DirectMessageListItemProps {
  dmThread: DirectMessageThreadPlaceholder;
  users: UserPlaceholder[]; // To look up user details
}

export function DirectMessageListItem({ dmThread, users }: DirectMessageListItemProps) {
  const getDmDisplayName = () => {
    if (dmThread.type === "individual") {
      const user = users.find((u) => u.id === dmThread.userId);
      return user?.name || t`Usuário Desconhecido`;
    }
    return dmThread.description;
  };

  const getDmAvatar = () => {
    if (dmThread.type === "individual") {
      const user = users.find((u) => u.id === dmThread.userId);
      return (
        <Avatar className="size-12 border-2">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
      );
    }
    // Group DM Avatars
    return (
      <>
        {dmThread.participants.slice(0, 2).map((member, idx) => {
          const user = users.find((u) => u.id === member.userId);
          return (
            <Avatar
              key={user?.id || idx}
              className={cn(
                "size-8 absolute border-2",
                idx % 2 === 0 ? "left-0 top-0" : "right-0 bottom-0"
              )}
            >
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          );
        })}
      </>
    );
  };

  return (
    <SidebarMenuItem key={dmThread.id}>
      <SidebarMenuButton className="h-12 hover:bg-accent/50" asChild>
        <Link
          to="/user/dm/$id"
          params={{ id: dmThread.id }}
          className="py-2"
          activeOptions={{ exact: true }}
          activeProps={{ className: "bg-accent" }}
        >
          <div className="flex flex-1 gap-2 items-center">
            <div className="w-12 h-12 relative flex items-center justify-center">
              {getDmAvatar()}
            </div>
            <div className="flex flex-1 justify-start items-center">
              <span>{getDmDisplayName()}</span>
            </div>
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
