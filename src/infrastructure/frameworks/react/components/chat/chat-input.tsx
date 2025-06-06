import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput() {
  return (
    <div className="flex flex-row items-center bg-card">
      {/* <Button
        variant="ghost"
        size="icon"
        className="size-12 text-zinc-400 dark:hover:bg-transparent cursor-pointer"
      >
        <PlusCircle className="size-8" />
      </Button> */}
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
        <ArrowUp className="size-8" />
      </Button>
    </div>
  );
}
