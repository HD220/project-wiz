import { useState } from "react";
import { CustomLink } from "@/components/custom-link";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Plus, Search, Settings, Home } from "lucide-react";
import { UserArea } from "./user-area";
import { ConversationList } from "../../direct-messages/components/conversation-list";

interface UserSidebarProps {
  // No more props drilling needed!
}

export function UserSidebar({}: UserSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* User Header */}
      <div className="h-12 px-3 flex items-center justify-between border-b border-border shadow-sm flex-none">
        <h2 className="font-semibold text-foreground truncate">
          Mensagens Diretas
        </h2>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border flex-none">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-2 space-y-1">
          {/* Navigation Items */}
          <div className="space-y-0.5 mb-4">
            <CustomLink
              to="/"
              className="w-full justify-start px-2 py-1.5 h-auto"
              activeOptions={{ exact: true }}
              activeProps={{
                className: "bg-secondary text-secondary-foreground",
              }}
            >
              <Home className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Dashboard</span>
            </CustomLink>
            <CustomLink
              to="/settings"
              className="w-full justify-start px-2 py-1.5 h-auto"
              activeProps={{
                className: "bg-secondary text-secondary-foreground",
              }}
            >
              <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Configurações</span>
            </CustomLink>
          </div>

          {/* Direct Messages */}
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
        </div>
      </ScrollArea>

      {/* User Area */}
      <UserArea />
    </div>
  );
}
