import { Brain, Search, Archive, Trash2, Clock, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import type {
  AgentMemoryWithMetadata,
  MemoryRelevanceScore,
  MemoryType,
  MemoryImportance,
} from "@/renderer/types/agent-memory.types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agentMemoryApi } from "@/lib/api/agent-memory";

interface AgentMemoryPanelProps {
  agentId: string;
  userId: string;
  conversationId?: string;
}

export function AgentMemoryPanel({
  agentId,
  userId,
  conversationId,
}: AgentMemoryPanelProps) {
  const [memories, setMemories] = useState<AgentMemoryWithMetadata[]>([]);
  const [searchResults, setSearchResults] = useState<MemoryRelevanceScore[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<MemoryType | "all">("all");
  const [filterImportance, setFilterImportance] = useState<
    MemoryImportance | "all"
  >("all");
  const [loading, setLoading] = useState(false);
  const [selectedMemory, setSelectedMemory] =
    useState<AgentMemoryWithMetadata | null>(null);

  const loadRecentMemories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await agentMemoryApi.getRecent(agentId, userId, 20);
      if (response.success && response.data) {
        setMemories(response.data);
      }
    } catch (error) {
      console.error("Failed to load memories:", error);
    } finally {
      setLoading(false);
    }
  }, [agentId, userId]);

  // Load recent memories on mount
  useEffect(() => {
    loadRecentMemories();
  }, [loadRecentMemories]);

  const searchMemories = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await agentMemoryApi.search({
        agentId,
        userId,
        query: searchQuery,
        type: filterType !== "all" ? filterType : undefined,
        importance: filterImportance !== "all" ? filterImportance : undefined,
        conversationId,
        limit: 50,
      });

      if (response.success && response.data) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error("Failed to search memories:", error);
    } finally {
      setLoading(false);
    }
  };

  const archiveMemory = async (memoryId: string) => {
    try {
      const response = await agentMemoryApi.archive(memoryId);
      if (response.success) {
        setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
        setSearchResults((prev) =>
          prev.filter((result) => result.memory.id !== memoryId),
        );
        if (selectedMemory?.id === memoryId) {
          setSelectedMemory(null);
        }
      }
    } catch (error) {
      console.error("Failed to archive memory:", error);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    try {
      const response = await agentMemoryApi.delete(memoryId);
      if (response.success) {
        setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
        setSearchResults((prev) =>
          prev.filter((result) => result.memory.id !== memoryId),
        );
        if (selectedMemory?.id === memoryId) {
          setSelectedMemory(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete memory:", error);
    }
  };

  const getImportanceColor = (importance: MemoryImportance) => {
    switch (importance) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeColor = (type: MemoryType) => {
    switch (type) {
      case "conversation":
        return "bg-blue-100 text-blue-800";
      case "preference":
        return "bg-purple-100 text-purple-800";
      case "learning":
        return "bg-green-100 text-green-800";
      case "context":
        return "bg-yellow-100 text-yellow-800";
      case "fact":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  interface MemoryCardProps {
    memory: AgentMemoryWithMetadata;
    relevanceScore?: number;
  }

  const MemoryCard = ({ memory, relevanceScore }: MemoryCardProps) => (
    <Card
      key={memory.id}
      className={`cursor-pointer transition-colors ${selectedMemory?.id === memory.id ? "ring-2 ring-blue-500" : ""}`}
      onClick={() => setSelectedMemory(memory)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getTypeColor(memory.type)}>{memory.type}</Badge>
            <div
              className={`w-2 h-2 rounded-full ${getImportanceColor(memory.importance)}`}
            />
            {relevanceScore && (
              <Badge variant="outline" className="text-xs">
                {(relevanceScore * 100).toFixed(0)}% relevant
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                archiveMemory(memory.id);
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                deleteMemory(memory.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          {memory.summary || memory.content.substring(0, 100) + "..."}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {formatDate(memory.createdAt)}
          {memory.accessCount > 0 && (
            <>
              <Separator orientation="vertical" className="h-3" />
              <Star className="h-3 w-3" />
              {memory.accessCount} accesses
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <Brain className="h-5 w-5" />
        <h2 className="font-semibold">Agent Memory</h2>
      </div>

      <Tabs defaultValue="recent" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {memories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
              {memories.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No memories found for this agent.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="search" className="flex-1 p-4 flex flex-col">
          <div className="space-y-4 mb-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value))
                  onKeyDown={(event) => event.key === "Enter" && searchMemories()}
                />
              </div>
              <Button onClick={searchMemories} disabled={loading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Select
                value={filterType}
                onValueChange={(value) =>
                  setFilterType(value as MemoryType | "all")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="conversation">Conversation</SelectItem>
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="context">Context</SelectItem>
                  <SelectItem value="fact">Fact</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterImportance}
                onValueChange={(value) =>
                  setFilterImportance(value as MemoryImportance | "all")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {searchResults.map(({ memory, relevanceScore }) => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  relevanceScore={relevanceScore}
                />
              ))}
              {searchQuery && searchResults.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No memories found matching your search.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {selectedMemory && (
        <div className="border-t p-4 max-h-1/3 overflow-y-auto">
          <h3 className="font-semibold mb-2">Memory Details</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Badge className={getTypeColor(selectedMemory.type)}>
                {selectedMemory.type}
              </Badge>
              <Badge variant="outline">{selectedMemory.importance}</Badge>
              <Badge variant="outline">
                Score: {selectedMemory.importanceScore.toFixed(2)}
              </Badge>
            </div>
            <p className="text-sm">{selectedMemory.content}</p>
            {selectedMemory.keywords && selectedMemory.keywords.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {selectedMemory.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
