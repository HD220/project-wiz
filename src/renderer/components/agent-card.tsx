import { useState } from "react";

// Local type definitions to avoid boundary violations
type AgentStatus = "active" | "inactive" | "busy";

interface SelectAgent {
  id: string;
  userId: string;
  providerId: string;
  name: string;
  role: string;
  backstory: string;
  goal: string;
  status: AgentStatus;
  modelConfig: string;
  createdAt: Date;
  updatedAt: Date;
}

import { useAgentStore } from "@/renderer/store/agent-store";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgentCardProps {
  agent: SelectAgent;
  providerName?: string;
}

export function AgentCard({ agent, providerName }: AgentCardProps) {
  const { updateAgentStatus, deleteAgent, error, clearError } = useAgentStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: AgentStatus) => {
    if (newStatus === agent.status) return;

    setIsUpdating(true);
    try {
      await updateAgentStatus(agent.id, newStatus);
    } catch (_error) {
      console.error("Failed to update agent status:", _error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAgent(agent.id);
      setIsDeleteDialogOpen(false);
    } catch (_error) {
      console.error("Failed to delete agent:", _error);
    }
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: AgentStatus) => {
    switch (status) {
      case "active":
        return "default";
      case "busy":
        return "secondary";
      case "inactive":
        return "outline";
      default:
        return "outline";
    }
  };

  // Parse model config to display model info
  let modelInfo = "Unknown Model";
  try {
    const config = JSON.parse(agent.modelConfig);
    modelInfo = config.model || "Unknown Model";
  } catch (error) {
    // Ignore parsing errors
  }

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm font-medium">
                {agent.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="text-sm">
                {agent.role}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleStatusChange("active")}
                disabled={isUpdating || agent.status === "active"}
              >
                Set Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange("inactive")}
                disabled={isUpdating || agent.status === "inactive"}
              >
                Set Inactive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Badge
              variant={getStatusVariant(agent.status)}
              className="capitalize"
            >
              <div
                className={`mr-1 h-2 w-2 rounded-full ${getStatusColor(agent.status)}`}
              />
              {agent.status}
            </Badge>
            {providerName && (
              <Badge variant="outline" className="text-xs">
                {providerName}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {modelInfo}
            </Badge>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Goal</p>
              <p className="text-sm">{agent.goal}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Backstory
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.backstory}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <span>
              Created {new Date(agent.createdAt).toLocaleDateString()}
            </span>
            <span>
              Updated {new Date(agent.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2 h-auto p-0 text-destructive underline"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{agent.name}&quot;? This
              action cannot be undone. The agent and its associated user account
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
