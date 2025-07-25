import { Link } from "@tanstack/react-router";
import { AlertTriangle, Bot, Plus } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent } from "@/renderer/components/ui/card";
import type { ConversationBlockingInfo } from "@/renderer/features/agent/agent.types";

interface BlockedConversationProps {
  blockingInfo: ConversationBlockingInfo;
  conversationName?: string;
  className?: string;
}

function BlockedConversation(props: BlockedConversationProps) {
  const { blockingInfo, conversationName, className } = props;

  return (
    <div
      className={`flex-1 flex items-center justify-center p-6 ${className || ""}`}
    >
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Warning Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Conversa Bloqueada</h3>
              <p className="text-sm text-muted-foreground">
                {conversationName ? (
                  <>
                    Não é possível enviar mensagens em{" "}
                    <strong>{conversationName}</strong>
                  </>
                ) : (
                  "Não é possível enviar mensagens nesta conversa"
                )}
              </p>
            </div>

            {/* Reason */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-left">
                  <p className="font-medium mb-1">Razão do bloqueio:</p>
                  <p className="text-muted-foreground">
                    {blockingInfo.message || "Nenhum agente ativo disponível"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">
                  {blockingInfo.activeAgentsCount}
                </span>{" "}
                agentes ativos
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Link to="/user/agents" search={{ showArchived: false }}>
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Gerenciar Agentes
                </Button>
              </Link>

              <p className="text-xs text-muted-foreground">
                Para continuar esta conversa, ative pelo menos um agente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { BlockedConversation };
