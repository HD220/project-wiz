import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { MarkdownRenderer } from "@/presentation/components/markdown-renderer"
import { ChatMessage } from "@/infrastructure/ipc/chat.types"
import { format } from "date-fns"

export function ChatMessage({ message }: { message: ChatMessage }) {
  const displayName = message.sender.name || 
    (message.sender.type === 'user' ? 'Você' : 
     message.sender.type === 'agent' ? 'Agente' : 'Sistema')

  const avatarFallback = displayName.charAt(0)

  return (
    <div className="group flex gap-4 px-4 py-2 hover:bg-zinc-800/50">
      <Avatar className="mt-0.5 h-10 w-10">
        <AvatarImage
          src={`/avatars/${message.sender.id}.png`}
          alt={displayName}
        />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline">
          <span className="mr-2 font-medium text-white">{displayName}</span>
          <span className="text-xs text-zinc-400">
            {format(message.timestamp, 'HH:mm')}
          </span>
        </div>
        {message.isMarkdown ? (
          <MarkdownRenderer 
            content={message.content} 
            className="text-zinc-200 [&>pre]:bg-zinc-800/50 [&>pre]:p-2 [&>pre]:rounded"
          />
        ) : (
          <p className="text-zinc-200">{message.content}</p>
        )}
      </div>
    </div>
  )
}
