import { MessageCircle } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";

interface EmptyConversationsProps {
  onCreateConversation: () => void;
  className?: string;
}

function EmptyConversations(props: EmptyConversationsProps) {
  const { onCreateConversation, className } = props;

  return (
    <Card
      className={`border-dashed border-2 border-muted-foreground/25 ${className || ""}`}
    >
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">No Conversations Yet</CardTitle>
        <CardDescription className="text-base">
          Start your first direct message conversation
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <p className="text-sm text-muted-foreground mb-6">
          Connect with other users or AI agents in private conversations. Select
          participants to begin chatting.
        </p>
        <Button onClick={onCreateConversation} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Start Conversation
        </Button>
      </CardContent>
    </Card>
  );
}

export { EmptyConversations };
