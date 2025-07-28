import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { cn } from "@/renderer/lib/utils";

interface UserAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showHover?: boolean;
}

export function UserAvatar(props: UserAvatarProps) {
  const { name = "User", size = "md", className, showHover = true } = props;

  const sizeClasses = {
    sm: "size-6 text-xs",
    md: "size-8 text-sm",
    lg: "size-12 text-base",
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        showHover &&
          "transition-all duration-200 hover:scale-[1.01] hover:shadow-md",
        className,
      )}
    >
      <AvatarFallback
        className="
          bg-gradient-to-br from-primary/90 to-primary 
          text-primary-foreground 
          font-semibold
          ring-2 ring-primary/20
          transition-all duration-200
          hover:ring-primary/40
        "
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
