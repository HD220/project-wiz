import { useState } from "react";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";

interface MessageInputProps {
  channelName: string;
  onSendMessage: (content: string, mentions?: string[]) => void;
  placeholder?: string;
}

export function MessageInput({
  channelName,
  onSendMessage,
  placeholder = "Message",
}: MessageInputProps) {
  const [content, setContent] = useState("");

  const handleSendMessage = () => {
    if (content.trim()) {
      // Basic mention detection for now. Can be expanded later.
      const mentions = content.match(/@\w+/g)?.map((m) => m.substring(1));
      onSendMessage(content, mentions);
      setContent("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg">
      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
        <Paperclip className="h-5 w-5" />
      </Button>
      <Input
        className="flex-1 bg-gray-700 border-none text-white placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
        <Smile className="h-5 w-5" />
      </Button>
      <Button onClick={handleSendMessage} className="bg-brand-500 hover:bg-brand-600">
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}