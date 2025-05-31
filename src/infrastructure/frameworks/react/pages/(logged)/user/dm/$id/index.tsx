import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/user/dm/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <ChatThread threadId={params.id} />;
}

// Mensagens de exemplo para canais e DMs
export const mensagensExemplo = [
  {
    id: "m1",
    autor: "Ana Silva",
    conteudo: "Olá, como estão todos?",
    timestamp: "Hoje às 10:30",
  },
  {
    id: "m2",
    autor: "Carlos Oliveira",
    conteudo: "Tudo bem por aqui!",
    timestamp: "Hoje às 10:32",
  },
  {
    id: "m3",
    autor: "Mariana Costa",
    conteudo: "Alguém vai jogar hoje à noite?",
    timestamp: "Hoje às 10:35",
  },
  {
    id: "m4",
    autor: "Pedro Santos",
    conteudo: "Eu topo! Que horas?",
    timestamp: "Hoje às 10:36",
  },
  {
    id: "m5",
    autor: "Ana Silva",
    conteudo: "Por volta das 20h?",
    timestamp: "Hoje às 10:38",
  },
  {
    id: "m6",
    autor: "Carlos Oliveira",
    conteudo: "Perfeito para mim!",
    timestamp: "Hoje às 10:40",
  },
  {
    id: "m7",
    autor: "Mariana Costa",
    conteudo: "Vou enviar o link do servidor mais tarde",
    timestamp: "Hoje às 10:42",
  },
  {
    id: "m8",
    autor: "Pedro Santos",
    conteudo: "👍",
    timestamp: "Hoje às 10:43",
  },
  {
    id: "m8",
    autor: "Pedro Santos",
    conteudo: "👍",
    timestamp: "Hoje às 10:43",
  },
  {
    id: "m8",
    autor: "Pedro Santos",
    conteudo: "👍",
    timestamp: "Hoje às 10:43",
  },
  {
    id: "m8",
    autor: "Pedro Santos",
    conteudo: "👍",
    timestamp: "Hoje às 10:43",
  },
  {
    id: "m8",
    autor: "Pedro Santos",
    conteudo: "👍",
    timestamp: "Hoje às 10:43",
  },
];

export function ChatThread({ threadId }: { threadId: string }) {
  const ref = useScroll([threadId], { behavior: "instant" });

  return (
    <div className="h-screen flex flex-1 flex-col">
      <header className="">
        <H3 className="m-2">{"Mensagens Diretas"}</H3>
        <Separator />
      </header>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-2">
            {mensagensExemplo.map((mensagem) => (
              <ChatMessage
                key={mensagem.id}
                autor={mensagem.autor}
                conteudo={mensagem.conteudo}
                timestamp={mensagem.timestamp}
              />
            ))}
            <div ref={ref} />
          </div>
        </ScrollArea>
      </div>
      <ChatInput />
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  autor: string;
  avatar?: string;
  conteudo: string;
  timestamp: string;
}

export function ChatMessage({
  autor,
  avatar,
  conteudo,
  timestamp,
}: ChatMessageProps) {
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

import { Button } from "@/components/ui/button";
import { PlusCircle, Smile } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { H3 } from "@/components/typography/titles";
import { useScroll } from "@/hooks/use-scroll";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput() {
  return (
    <div className="flex flex-row items-start bg-card">
      <Button
        variant="ghost"
        size="icon"
        className="size-12 text-zinc-400 dark:hover:bg-transparent cursor-pointer"
      >
        <PlusCircle className="size-8" />
      </Button>
      <div className="flex flex-1 p-4">
        <ScrollArea className="flex-1 max-h-40 ">
          <Textarea
            className=" flex-1 h-full resize-none border-none focus-visible:ring-0 dark:bg-card"
            placeholder="Enviar mensagem"
          />
        </ScrollArea>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="size-12 text-zinc-400 dark:hover:bg-transparent cursor-pointer"
      >
        <Smile className="size-8" />
      </Button>
    </div>
  );
}
