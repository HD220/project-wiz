import * as React from "react";
import { MessageSquare } from "lucide-react";

import type { UserSummary } from "@/main/features/user/user.service";
import { OptimizedAvatar } from "@/renderer/components/ui/optimized-avatar";
import { cn } from "@/renderer/lib/utils";

type UserStatus = "online" | "away" | "busy" | "offline";

const getStatusColor = (status: UserStatus): string => {
  switch (status) {
    case "online":
      return "bg-emerald-500 shadow-emerald-500/30";
    case "away":
      return "bg-amber-500 shadow-amber-500/30";
    case "busy":
      return "bg-red-500 shadow-red-500/30";
    case "offline":
    default:
      return "bg-gray-400 shadow-gray-400/20";
  }
};

const getUserStatus = (user: UserSummary): UserStatus => {
  // TODO: Implement actual user status logic based on real data
  // For demo purposes, randomly assign status based on user ID
  const hash = user.id.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const statusIndex = Math.abs(hash) % 4;
  const statuses: UserStatus[] = ["online", "away", "busy", "offline"];
  return statuses[statusIndex] || "offline";
};

const profileAvatarVariants = {
  size: {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  },
  statusSize: {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  },
  ring: {
    sm: "ring-1",
    md: "ring-1",
    lg: "ring-2",
  },
  counterSize: {
    sm: "h-6 w-6 text-[10px]",
    md: "h-7 w-7 text-xs",
    lg: "h-8 w-8 text-sm",
  },
};

// Root ProfileAvatar component
interface ProfileAvatarProps {
  size?: keyof typeof profileAvatarVariants.size;
  className?: string;
  children: React.ReactNode;
}

const ProfileAvatar = React.forwardRef<HTMLDivElement, ProfileAvatarProps>(
  ({ size = "md", className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {children}
      </div>
    );
  },
);
ProfileAvatar.displayName = "ProfileAvatar";

// Image sub-component
interface ProfileAvatarImageProps {
  user: UserSummary;
  size?: keyof typeof profileAvatarVariants.size;
  className?: string;
}

const ProfileAvatarImage = React.forwardRef<
  HTMLDivElement,
  ProfileAvatarImageProps
>(({ user, size = "md", className, ...props }, ref) => {
  return (
    <OptimizedAvatar
      ref={ref}
      src={user.avatar}
      size={size}
      fallbackContent={user.name.charAt(0).toUpperCase()}
      className={cn(
        profileAvatarVariants.size[size],
        profileAvatarVariants.ring[size],
        "ring-background shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.01]",
        className,
      )}
      {...props}
    />
  );
});
ProfileAvatarImage.displayName = "ProfileAvatarImage";

// Fallback sub-component
interface ProfileAvatarFallbackProps {
  size?: keyof typeof profileAvatarVariants.size;
  className?: string;
  children?: React.ReactNode;
}

const ProfileAvatarFallback = React.forwardRef<
  HTMLDivElement,
  ProfileAvatarFallbackProps
>(({ size = "md", className, children, ...props }, ref) => {
  return (
    <OptimizedAvatar
      ref={ref}
      size={size}
      fallbackContent={children || <MessageSquare className="w-1/2 h-1/2" />}
      className={cn(
        profileAvatarVariants.size[size],
        profileAvatarVariants.ring[size],
        "ring-background shadow-md transition-all duration-200",
        className,
      )}
      fallbackClassName="bg-gradient-to-br from-muted to-muted-foreground/20 text-muted-foreground border border-border/50"
      {...props}
    />
  );
});
ProfileAvatarFallback.displayName = "ProfileAvatarFallback";

// Status sub-component
interface ProfileAvatarStatusProps {
  user: UserSummary;
  size?: keyof typeof profileAvatarVariants.size;
  className?: string;
}

const ProfileAvatarStatus = React.forwardRef<
  HTMLDivElement,
  ProfileAvatarStatusProps
>(({ user, size = "md", className, ...props }, ref) => {
  const status = getUserStatus(user);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background shadow-sm status-pulse z-30",
        profileAvatarVariants.statusSize[size],
        getStatusColor(status),
        className,
      )}
      {...props}
    />
  );
});
ProfileAvatarStatus.displayName = "ProfileAvatarStatus";

// Counter sub-component for group avatars
interface ProfileAvatarCounterProps {
  count: number;
  size?: keyof typeof profileAvatarVariants.size;
  className?: string;
}

const ProfileAvatarCounter = React.forwardRef<
  HTMLDivElement,
  ProfileAvatarCounterProps
>(({ count, size = "md", className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-20 rounded-full border-2 border-background shadow-md",
        "bg-gradient-to-br from-primary/80 to-primary/70 text-primary-foreground",
        "flex items-center justify-center font-bold",
        "bottom-0 right-0 transform translate-x-1/12 translate-y-1/6",
        profileAvatarVariants.counterSize[size],
        className,
      )}
      {...props}
    >
      +{count}
    </div>
  );
});
ProfileAvatarCounter.displayName = "ProfileAvatarCounter";

// Group sub-component
interface ProfileAvatarGroupProps {
  participants: Array<{
    id: string;
    conversationId: string;
    participantId: string;
    isActive: boolean;
    deactivatedAt: Date | null;
    deactivatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  availableUsers: UserSummary[];
  currentUserId?: string;
  size?: keyof typeof profileAvatarVariants.size;
  showStatus?: boolean;
  className?: string;
}

const ProfileAvatarGroup = React.forwardRef<
  HTMLDivElement,
  ProfileAvatarGroupProps
>(
  (
    {
      participants,
      availableUsers,
      currentUserId,
      size = "md",
      showStatus = false,
      className,
      ...props
    },
    ref,
  ) => {
    // Get other participants (exclude current user)
    const otherParticipants = participants
      .filter((participant) => participant.participantId !== currentUserId)
      .map((participant) =>
        availableUsers.find((user) => user.id === participant.participantId),
      )
      .filter(Boolean) as UserSummary[];

    // If no other participants, show fallback
    if (otherParticipants.length === 0) {
      return (
        <ProfileAvatarFallback
          ref={ref}
          size={size}
          className={className}
          {...props}
        />
      );
    }

    // For 1:1 conversations, show single avatar
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return (
        <ProfileAvatar ref={ref} size={size} className={className} {...props}>
          <ProfileAvatarImage user={participant} size={size} />
          {showStatus && <ProfileAvatarStatus user={participant} size={size} />}
        </ProfileAvatar>
      );
    }

    // For group conversations, show main avatar + counter
    const firstParticipant = otherParticipants[0];
    const remainingCount = otherParticipants.length - 1;

    return (
      <ProfileAvatar ref={ref} size={size} className={className} {...props}>
        <ProfileAvatarImage user={firstParticipant} size={size} />
        {showStatus && (
          <ProfileAvatarStatus user={firstParticipant} size={size} />
        )}
        {remainingCount > 0 && (
          <ProfileAvatarCounter count={remainingCount} size={size} />
        )}
      </ProfileAvatar>
    );
  },
);
ProfileAvatarGroup.displayName = "ProfileAvatarGroup";

export {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarFallback,
  ProfileAvatarStatus,
  ProfileAvatarCounter,
  ProfileAvatarGroup,
};
