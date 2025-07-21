import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  name = "User",
  size = "md",
  className,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
