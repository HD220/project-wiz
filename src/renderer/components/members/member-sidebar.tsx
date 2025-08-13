import { Crown, Users } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/renderer/features/user/components/profile-avatar";
import type { UserStatusType } from "@/renderer/features/user/components/user-status";
import { cn } from "@/renderer/lib/utils";

export interface Member {
  id: string;
  name: string;
  username?: string;
  status: UserStatusType;
  role?: "owner" | "admin" | "member";
  avatarUrl?: string;
  type?: "human" | "agent";
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

  const getStatusLabel = (status: Member["status"]) => {
    switch (status) {
      case "online":
        return "ONLINE";
      case "away":
        return "AWAY";
      case "busy":
        return "BUSY";
      case "offline":
      default:
        return "OFFLINE";
    }
  };

  const MemberItem = ({ member }: { member: Member }) => (
    <Button
      variant="ghost"
      className="w-full justify-start h-auto p-2 text-sm font-normal hover:bg-accent/50 transition-all duration-150 group rounded-md focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${member.name} - ${getStatusLabel(member.status)}${member.role === "owner" ? " (Owner)" : ""}`}
    >
      <div className="flex items-center w-full gap-3">
        <div className="relative flex-shrink-0">
          <ProfileAvatar size="sm">
            <ProfileAvatarImage
              src={member.avatarUrl}
              name={member.name}
              size="sm"
              className="ring-1 shadow-sm ring-border/50"
            />
            <ProfileAvatarStatus id={member.id} size="sm" />
          </ProfileAvatar>
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
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
        <div className="px-3 py-1.5">
          <h3
            id={`${status}-members-heading`}
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
          >
            {title} — {count}
          </h3>
        </div>
        <div className="space-y-1" role="list">
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
        <div className="p-2 space-y-3">
          {/* Online Members */}
          <MemberSection
            title="ONLINE"
            members={online}
            count={online.length}
            status="online"
          />

          {/* Away Members */}
          <MemberSection
            title="AWAY"
            members={away}
            count={away.length}
            status="away"
          />

          {/* Busy Members */}
          <MemberSection
            title="BUSY"
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
            title="OFFLINE"
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
              <p className="text-sm text-muted-foreground">No members found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

