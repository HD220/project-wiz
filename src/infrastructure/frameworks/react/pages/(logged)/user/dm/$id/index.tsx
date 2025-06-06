import { ChatMessageProps } from "@/components/chat/chat-message";
import { ChatThread } from "@/components/chat/chat-thread";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(logged)/user/dm/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <ChatThread threadId={params.id} messages={mensagensExemplo} />;
}

// Mensagens de exemplo para canais e DMs
export const mensagensExemplo: ChatMessageProps[] = [
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
    id: "m9",
    autor: "Pedro Santos",
    conteudo: "👍",
    timestamp: "Hoje às 10:43",
  },
  {
    id: "m10",
    autor: "Pedro Santos",
    conteudo: "👍",
    timestamp: "Hoje às 10:43",
  },
  {
    id: "m11",
    autor: "Pedro Santos",
    conteudo: "👍",
    timestamp: "Hoje às 10:43",
  },
  {
    id: "m12",
    autor: "Pedro Santos",
    conteudo: "👍",
    timestamp: "Hoje às 10:43",
  },
];
