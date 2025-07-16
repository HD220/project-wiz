import { format } from "date-fns";
import { CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageHeaderProps {
  senderName: string;
  senderType: "user" | "agent" | "system";
  messageType: "text" | "task_update" | "system" | "file_share" | "code";
  timestamp: Date;
  isEdited?: boolean;
}

export function MessageHeader({ senderName, senderType, messageType, timestamp, isEdited }: MessageHeaderProps) {
  const getMessageIcon = () => {
    switch (messageType) {
      case "task_update":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "system":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSenderColor = () => {
    return senderType === "agent" ? "text-purple-300" : "text-white";
  };

  return (
    <div className="flex items-center space-x-2 mb-1">
      <span className={cn("font-medium", getSenderColor())}>
        {senderName}
      </span>
      <span className="text-xs text-gray-500">
        {format(timestamp, "HH:mm")}
      </span>
      {isEdited && (
        <span className="text-xs text-gray-500">(edited)</span>
      )}
      {getMessageIcon()}
    </div>
  );
}