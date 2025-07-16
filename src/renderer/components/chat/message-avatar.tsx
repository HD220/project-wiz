import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageAvatarProps {
  senderId: string;
  senderName: string;
  senderType: "user" | "agent" | "system";
}

export function MessageAvatar({ senderId, senderName, senderType }: MessageAvatarProps) {
  const getAvatarSrc = () => {
    return senderType === "agent" ? `/agents/${senderId}.png` : undefined;
  };

  const getAvatarBgColor = () => {
    return senderType === "agent" ? "bg-purple-500" : "bg-brand-500";
  };

  const getInitials = () => {
    return senderName.slice(0, 2).toUpperCase();
  };

  return (
    <Avatar className="w-10 h-10 mt-1">
      <AvatarImage src={getAvatarSrc()} />
      <AvatarFallback className={cn(getAvatarBgColor())}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}