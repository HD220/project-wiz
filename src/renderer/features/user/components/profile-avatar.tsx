import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";

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

const getStatusFromId = (id: string): UserStatus => {
  const hash = id.split("").reduce((a, b) => {
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
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
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

// Container principal
function ProfileAvatar({
  size = "md",
  className,
  children,
  ...props
}: {
  size?: keyof typeof profileAvatarVariants.size;
  className?: string;
  children: React.ReactNode;
} & React.ComponentProps<"div">) {
  return (
    <div
      data-slot="profile-avatar"
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ÚNICO avatar - serve para TUDO (usuário, agente, conversa)
function ProfileAvatarImage({
  src,
  name,
  size = "md",
  className,
  fallbackIcon,
  ...props
}: {
  src?: string | null;
  name?: string;
  size?: keyof typeof profileAvatarVariants.size;
  className?: string;
  fallbackIcon?: React.ReactNode;
} & React.ComponentProps<"div">) {
  const validSrc = isValidAvatarUrl(src);

  return (
    <Avatar
      data-slot="profile-avatar-image"
      className={cn(
        profileAvatarVariants.size[size],
        profileAvatarVariants.ring[size],
        "ring-background shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.01]",
        className,
      )}
      {...props}
    >
      {validSrc && <AvatarImage src={validSrc} className="object-cover" />}
      <AvatarFallback
        className={cn(
          "font-semibold flex items-center justify-center",
          name && name.trim()
            ? "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground ring-2 ring-primary/20"
            : "bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/20",
        )}
      >
        {name && name.trim() ? name.charAt(0).toUpperCase() : (fallbackIcon || "?")}
      </AvatarFallback>
    </Avatar>
  );
}

// Badge de status
function ProfileAvatarStatus({
  id,
  status,
  size = "md",
  className,
  ...props
}: {
  id?: string;
  status?: UserStatus;
  size?: keyof typeof profileAvatarVariants.size;
  className?: string;
} & React.ComponentProps<"div">) {
  const finalStatus = status || (id ? getStatusFromId(id) : "offline");

  return (
    <div
      data-slot="profile-avatar-status"
      className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background shadow-sm status-pulse z-30",
        profileAvatarVariants.statusSize[size],
        getStatusColor(finalStatus),
        className,
      )}
      {...props}
    />
  );
}

// Contador para grupos
function ProfileAvatarCounter({
  count,
  size = "md",
  className,
  ...props
}: {
  count: number;
  size?: keyof typeof profileAvatarVariants.size;
  className?: string;
} & React.ComponentProps<"div">) {
  return (
    <div
      data-slot="profile-avatar-counter"
      className={cn(
        "absolute z-20 rounded-full border-2 border-background shadow-md",
        "bg-gradient-to-br from-primary/80 to-primary/70 text-primary-foreground",
        "flex items-center justify-center font-bold",
        "bottom-0 right-0 transform translate-x-1 translate-y-1",
        profileAvatarVariants.counterSize[size],
        className,
      )}
      {...props}
    >
      +{count}
    </div>
  );
}

export {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
  ProfileAvatarCounter,
};
