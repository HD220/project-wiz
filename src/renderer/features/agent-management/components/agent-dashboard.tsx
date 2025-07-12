import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Users,
  Plus,
  Search,
  Settings,
  Activity,
  MessageSquare,
  Play,
  Pause,
  Filter,
  Loader2,
} from "lucide-react";
import { mockAgents, Agent } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

interface AgentDashboardProps {
  className?: string;
}

export function AgentDashboard({ className }: AgentDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || agent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const onlineAgents = mockAgents.filter((a) => a.status !== "offline");
  const executingAgents = mockAgents.filter((a) => a.isExecuting);

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "executing":
        return "bg-blue-500";
      case "busy":
        return "bg-red-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: Agent["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "executing":
        return "Executando";
      case "busy":
        return "Ocupado";
      case "away":
        return "Ausente";
      case "offline":
        return "Offline";
      default:
        return "Desconhecido";
    }
  };

  const handleAgentAction = (action: string, agent: Agent) => {
    console.log(`${action} action for agent:`, agent.id);
  };

  return (
    <ScrollArea className="h-full">
      <div className={cn("p-6 space-y-6", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Agentes</h1>
            <p className="text-muted-foreground">
              Monitore e gerencie todos os seus agentes IA
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Agente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Agentes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAgents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {onlineAgents.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executando</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {executingAgents.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tipos Únicos
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(mockAgents.map((a) => a.type)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Agentes</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar agentes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="online">Online</TabsTrigger>
                    <TabsTrigger value="executing">Executando</TabsTrigger>
                    <TabsTrigger value="busy">Ocupados</TabsTrigger>
                    <TabsTrigger value="offline">Offline</TabsTrigger>
                  </TabsList>

                  <TabsContent value={filterStatus} className="mt-4">
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {filteredAgents.map((agent) => (
                          <AgentCard
                            key={agent.id}
                            agent={agent}
                            isSelected={selectedAgent?.id === agent.id}
                            onSelect={() => setSelectedAgent(agent)}
                            onAction={handleAgentAction}
                            getStatusColor={getStatusColor}
                            getStatusText={getStatusText}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Agent Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Agente</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAgent ? (
                  <AgentDetails
                    agent={selectedAgent}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    onAction={handleAgentAction}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Selecione um agente para ver os detalhes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
  onAction: (action: string, agent: Agent) => void;
  getStatusColor: (status: Agent["status"]) => string;
  getStatusText: (status: Agent["status"]) => string;
}

function AgentCard({
  agent,
  isSelected,
  onSelect,
  onAction,
  getStatusColor,
  getStatusText,
}: AgentCardProps) {
  return (
    <div
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-colors",
        isSelected ? "border-primary bg-accent" : "hover:bg-accent/50",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={agent.avatar} />
              <AvatarFallback>
                {agent.avatar || agent.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 border-2 border-background rounded-full",
                getStatusColor(agent.status),
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{agent.name}</h4>
              {agent.isExecuting && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {agent.currentTask || agent.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="text-xs">
            {agent.type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {getStatusText(agent.status)}
          </span>
        </div>
      </div>

      {agent.isExecuting && agent.executionProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso</span>
            <span>{agent.executionProgress}%</span>
          </div>
          <Progress value={agent.executionProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}

interface AgentDetailsProps {
  agent: Agent;
  getStatusColor: (status: Agent["status"]) => string;
  getStatusText: (status: Agent["status"]) => string;
  onAction: (action: string, agent: Agent) => void;
}

function AgentDetails({
  agent,
  getStatusColor,
  getStatusText,
  onAction,
}: AgentDetailsProps) {
  return (
    <div className="space-y-4">
      {/* Agent Header */}
      <div className="text-center">
        <div className="relative inline-block mb-3">
          <Avatar className="w-16 h-16">
            <AvatarImage src={agent.avatar} />
            <AvatarFallback className="text-lg">
              {agent.avatar || agent.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 border-2 border-background rounded-full",
              getStatusColor(agent.status),
            )}
          />
        </div>
        <h3 className="font-semibold text-lg">{agent.name}</h3>
        <p className="text-sm text-muted-foreground">{agent.description}</p>
      </div>

      {/* Status and Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge variant="outline">{getStatusText(agent.status)}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tipo:</span>
          <Badge>{agent.type}</Badge>
        </div>

        {agent.currentTask && (
          <div>
            <span className="text-sm font-medium">Tarefa Atual:</span>
            <p className="text-sm text-muted-foreground mt-1">
              {agent.currentTask}
            </p>
          </div>
        )}

        {agent.isExecuting && agent.executionProgress && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Progresso:</span>
              <span>{agent.executionProgress}%</span>
            </div>
            <Progress value={agent.executionProgress} />
          </div>
        )}
      </div>

      {/* Capabilities */}
      <div>
        <span className="text-sm font-medium">Capacidades:</span>
        <div className="flex flex-wrap gap-1 mt-2">
          {agent.capabilities.map((capability) => (
            <Badge key={capability} variant="secondary" className="text-xs">
              {capability}
            </Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-4 border-t">
        <Button
          className="w-full"
          size="sm"
          onClick={() => onAction("chat", agent)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Conversar
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onAction(agent.isExecuting ? "pause" : "start", agent)
            }
          >
            {agent.isExecuting ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("settings", agent)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Config
          </Button>
        </div>
      </div>
    </div>
  );
}
