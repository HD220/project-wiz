import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import { cn } from "@/renderer/lib/utils";

interface UserAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function UserAvatar(props: UserAvatarProps) {
  const { name = "User", size = "md", className } = props;
  
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

export { UserAvatar };
