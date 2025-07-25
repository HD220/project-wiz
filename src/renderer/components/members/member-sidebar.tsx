import { Crown, Users, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { cn } from "@/renderer/lib/utils";

interface Member {
  id: string;
  name: string;
  username?: string;
  status: "online" | "away" | "busy" | "offline";
  role?: "owner" | "admin" | "member";
  avatarUrl?: string;
}

interface MemberSidebarProps {
  members: Member[];
  memberCount?: number;
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

function MemberSidebar(props: MemberSidebarProps) {
  const {
    members,
    memberCount = members.length,
    className,
    isCollapsed = false,
    onToggle,
  } = props;

  // Group members by status
  const onlineMembers = members.filter((m) => m.status === "online");
  const offlineMembers = members.filter((m) => m.status === "offline");
  const awayMembers = members.filter((m) => m.status === "away");
  const busyMembers = members.filter((m) => m.status === "busy");

  const getStatusColor = (status: Member["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "offline":
      default:
        return "bg-gray-400";
    }
  };

  const MemberItem = ({ member }: { member: Member }) => (
    <Button
      variant="ghost"
      className="w-full justify-start px-2 h-9 text-sm font-normal hover:bg-accent/80 transition-colors group rounded-md"
    >
      <div className="flex items-center w-full">
        <div className="relative">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Status indicator */}
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
              getStatusColor(member.status),
            )}
          />
        </div>
        <div className="ml-2 flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {member.role === "owner" && (
              <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
            )}
            <span className="text-foreground truncate text-sm group-hover:text-foreground/90 transition-colors">
              {member.name}
            </span>
          </div>
          {member.username && (
            <div className="text-xs text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
              @{member.username}
            </div>
          )}
        </div>
      </div>
    </Button>
  );

  const MemberSection = ({
    title,
    members: sectionMembers,
    count,
  }: {
    title: string;
    members: Member[];
    count: number;
  }) => {
    if (count === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-2 py-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title} — {count}
          </h3>
        </div>
        <div className="space-y-0.5">
          {sectionMembers.map((member) => (
            <MemberItem key={member.id} member={member} />
          ))}
        </div>
      </div>
    );
  };

  if (isCollapsed) {
    return null; // Hide sidebar when collapsed
  }

  return (
    <div className={cn("h-full flex flex-col bg-card border-l", className)}>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {/* Online Members */}
          <MemberSection
            title="Online"
            members={onlineMembers}
            count={onlineMembers.length}
          />

          {/* Away Members */}
          <MemberSection
            title="Ausente"
            members={awayMembers}
            count={awayMembers.length}
          />

          {/* Busy Members */}
          <MemberSection
            title="Ocupado"
            members={busyMembers}
            count={busyMembers.length}
          />

          {/* Separator between online and offline */}
          {(onlineMembers.length > 0 ||
            awayMembers.length > 0 ||
            busyMembers.length > 0) &&
            offlineMembers.length > 0 && <Separator className="my-2" />}

          {/* Offline Members */}
          <MemberSection
            title="Offline"
            members={offlineMembers}
            count={offlineMembers.length}
          />

          {/* Empty state */}
          {members.length === 0 && (
            <div className="px-2 py-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhum membro encontrado
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export { MemberSidebar, type Member };
