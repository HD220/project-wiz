import { ChevronDown, Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../components/ui/collapsible";
import { CustomLink } from "../../../../components/custom-link";
import { ConversationList } from "./conversation-list";

export function UserSidebarDirectMessages() {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-1 py-1 h-auto group"
        >
          <ChevronDown className="w-3 h-3 mr-1" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Mensagens Diretas
          </span>
          <CustomLink
            to="/new-conversation"
            variant="ghost"
            size="icon"
            className="ml-auto w-4 h-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-accent"
          >
            <Plus className="h-3 w-3" />
          </CustomLink>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <ConversationList />
      </CollapsibleContent>
    </Collapsible>
  );
}
