import { useState } from "react";
import { cn } from "@/renderer/lib/utils";
import { Button } from "@/renderer/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Input } from "@/renderer/components/ui/input";
import {
  Hash,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Volume2,
  VolumeX,
  Settings,
  UserPlus,
  Circle,
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  hasNotifications?: boolean;
  mentionCount?: number;
}

interface Agent {
  id: string;
  name: string;
  status: "online" | "idle" | "working" | "offline";
  avatar?: string;
  currentTask?: string;
}

interface ChannelsSidebarProps {
  projectName: string;
  channels: Channel[];
  agents: Agent[];
  selectedChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  onAgentDMSelect: (agentId: string) => void;
  onAddChannel: () => void;
}

export function ChannelsSidebar({
  projectName,
  channels,
  agents,
  selectedChannelId,
  onChannelSelect,
  onAgentDMSelect,
  onAddChannel,
}: ChannelsSidebarProps) {
  const [textChannelsCollapsed, setTextChannelsCollapsed] = useState(false);
  const [agentsCollapsed, setAgentsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "working":
        return "bg-blue-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Agent["status"]) => {
    switch (status) {
      case "online":
        return "Available";
      case "idle":
        return "Idle";
      case "working":
        return "Working";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-[240px] bg-gray-800 flex flex-col">
      {/* Project Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-700 shadow-md">
        <h1 className="font-semibold text-white truncate">{projectName}</h1>
        <Button variant="ghost" size="icon" className="w-6 h-6">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search channels and agents"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-gray-900 border-gray-600 text-gray-300 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Text Channels */}
        <div className="px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTextChannelsCollapsed(!textChannelsCollapsed)}
            className="w-full justify-start text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wide"
          >
            {textChannelsCollapsed ? (
              <ChevronRight className="h-3 w-3 mr-1" />
            ) : (
              <ChevronDown className="h-3 w-3 mr-1" />
            )}
            Text Channels
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onAddChannel();
              }}
              className="ml-auto w-4 h-4 p-0 hover:bg-gray-600"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </Button>

          {!textChannelsCollapsed && (
            <div className="space-y-1 mt-1">
              {filteredChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onChannelSelect(channel.id)}
                  className={cn(
                    "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700",
                    selectedChannelId === channel.id &&
                      "bg-gray-700 text-white",
                  )}
                >
                  <Hash className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{channel.name}</span>
                  {channel.hasNotifications && (
                    <div className="ml-auto">
                      {channel.mentionCount ? (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                          {channel.mentionCount > 99
                            ? "99+"
                            : channel.mentionCount}
                        </span>
                      ) : (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </div>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Agents */}
        <div className="px-2 py-1 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAgentsCollapsed(!agentsCollapsed)}
            className="w-full justify-start text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wide"
          >
            {agentsCollapsed ? (
              <ChevronRight className="h-3 w-3 mr-1" />
            ) : (
              <ChevronDown className="h-3 w-3 mr-1" />
            )}
            Agents ({agents.filter((a) => a.status !== "offline").length})
          </Button>

          {!agentsCollapsed && (
            <div className="space-y-1 mt-1">
              {filteredAgents.map((agent) => (
                <Button
                  key={agent.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onAgentDMSelect(agent.id)}
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 h-auto py-2"
                >
                  <div className="relative mr-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback className="text-xs bg-brand-500">
                        {agent.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800",
                        getStatusColor(agent.status),
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="truncate font-medium">
                        {agent.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {getStatusText(agent.status)}
                      </span>
                    </div>
                    {agent.currentTask && (
                      <div className="text-xs text-gray-400 truncate">
                        Working on: {agent.currentTask}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Area */}
      <div className="p-2 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-brand-500 text-white">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">User</div>
            <div className="text-xs text-gray-400">Project Manager</div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <Volume2 className="h-4 w-4 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" className="w-6 h-6">
              <Settings className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}