import { Edit, Trash2, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
  messageId: string;
  senderType: "user" | "agent" | "system";
  onEdit: () => void;
  onDelete: (messageId: string) => void;
  onReply?: (messageId: string) => void;
}

export function MessageActions({ messageId, senderType, onEdit, onDelete, onReply }: MessageActionsProps) {
  return (
    <div className="absolute top-0 right-4 bg-gray-800 border border-gray-600 rounded shadow-lg flex">
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8"
        onClick={() => onReply?.(messageId)}
      >
        <Reply className="h-4 w-4" />
      </Button>
      {senderType === "user" && (
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 text-red-400 hover:text-red-300"
        onClick={() => onDelete(messageId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}