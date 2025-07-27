import { Crown, Users } from "lucide-react";

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

export function MemberSidebar(props: MemberSidebarProps) {
  const { members, className, isCollapsed = false } = props;

  // Group members by status with better organization
  const memberGroups = {
    online: members.filter((m) => m.status === "online"),
    away: members.filter((m) => m.status === "away"),
    busy: members.filter((m) => m.status === "busy"),
    offline: members.filter((m) => m.status === "offline"),
  } as const;

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
        return "bg-muted-foreground";
    }
  };

  const getStatusLabel = (status: Member["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Ausente";
      case "busy":
        return "Ocupado";
      case "offline":
      default:
        return "Offline";
    }
  };

  const MemberItem = ({ member }: { member: Member }) => (
    <Button
      variant="ghost"
      className="w-full justify-start px-4 h-10 text-sm font-normal hover:bg-accent/60 transition-all duration-200 group rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${member.name} - ${getStatusLabel(member.status)}${member.role === "owner" ? " (Owner)" : ""}`}
    >
      <div className="flex items-center w-full gap-4">
        <div className="relative flex-shrink-0">
          <Avatar className="w-8 h-8">
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
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {member.role === "owner" && (
              <Crown
                className="w-3 h-3 text-yellow-500 flex-shrink-0"
                aria-label="Owner"
              />
            )}
            <span className="text-foreground truncate text-sm group-hover:text-foreground transition-colors font-medium">
              {member.name}
            </span>
          </div>
          {member.username && (
            <div className="text-xs text-muted-foreground truncate opacity-60 group-hover:opacity-100 transition-opacity">
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
    status,
  }: {
    title: string;
    members: Member[];
    count: number;
    status: Member["status"];
  }) => {
    if (count === 0) return null;

    return (
      <section
        className="mb-4"
        role="group"
        aria-labelledby={`${status}-members-heading`}
      >
        <div className="px-4 py-2">
          <h3
            id={`${status}-members-heading`}
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
          >
            {title} — {count}
          </h3>
        </div>
        <div className="space-y-2" role="list">
          {sectionMembers.map((member) => (
            <div key={member.id} role="listitem">
              <MemberItem member={member} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  if (isCollapsed) {
    return null; // Hide sidebar when collapsed
  }

  const { online, away, busy, offline } = memberGroups;
  const hasActiveMembers =
    online.length > 0 || away.length > 0 || busy.length > 0;

  return (
    <aside
      className={cn(
        "h-full flex flex-col bg-card/50 backdrop-blur-sm border-l border-border/50",
        className,
      )}
      role="complementary"
      aria-label="Member list"
    >
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Online Members */}
          <MemberSection
            title="Online"
            members={online}
            count={online.length}
            status="online"
          />

          {/* Away Members */}
          <MemberSection
            title="Ausente"
            members={away}
            count={away.length}
            status="away"
          />

          {/* Busy Members */}
          <MemberSection
            title="Ocupado"
            members={busy}
            count={busy.length}
            status="busy"
          />

          {/* Separator between active and offline */}
          {hasActiveMembers && offline.length > 0 && (
            <Separator className="my-3" />
          )}

          {/* Offline Members */}
          <MemberSection
            title="Offline"
            members={offline}
            count={offline.length}
            status="offline"
          />

          {/* Empty state */}
          {members.length === 0 && (
            <div
              className="px-3 py-8 text-center"
              role="status"
              aria-live="polite"
            >
              <Users className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Nenhum membro encontrado
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

export type { Member };
