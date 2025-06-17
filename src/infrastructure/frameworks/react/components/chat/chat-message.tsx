import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export type ChatMessageProps = {
  id: string;
  autor: string;
  avatar?: string;
  conteudo: string;
  timestamp: string;
  isCurrentUser?: boolean;
};

export function ChatMessage({
  message: { autor, avatar, conteudo, timestamp, isCurrentUser },
}: {
  message: ChatMessageProps;
}) {
  // TODO: Use `isCurrentUser` to apply different styling for user vs other messages
  return (
    <div className="group flex gap-4 px-4 py-2 hover:bg-zinc-800/50">
      <Avatar className="mt-0.5 h-10 w-10">
        <AvatarImage
          src={avatar || "/placeholder.svg?height=40&width=40"}
          alt={autor}
        />
        <AvatarFallback>{autor.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline">
          <span className="mr-2 font-medium text-white">{autor}</span>
          <span className="text-xs text-zinc-400">{timestamp}</span>
        </div>
        <p className="text-zinc-200">{conteudo}</p>
      </div>
    </div>
  );
}
