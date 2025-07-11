import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Badge } from "@/renderer/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { PlusCircle, Search, Filter, ArrowRightCircle } from "lucide-react";

interface Issue {
  id: string;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  assignedToAgentId?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: Issue["status"];
}

const initialColumns: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", status: "open" },
  { id: "todo", title: "To Do", status: "open" }, // Issues in 'open' status can be in Backlog or To Do
  { id: "in-progress", title: "In Progress", status: "in_progress" },
  { id: "done", title: "Done", status: "resolved" },
  { id: "closed", title: "Closed", status: "closed" },
];

interface KanbanBoardProps {
  issues: Issue[];
  onIssueUpdate: (issueId: string, newStatus: Issue["status"]) => void;
  onAddIssue: () => void;
}

export function KanbanBoard({ issues, onIssueUpdate, onAddIssue }: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<Issue["status"] | "all">("all");

  const getIssuesForColumn = (columnStatus: Issue["status"]) => {
    let filtered = issues.filter((issue) => {
      if (columnStatus === "open") {
        // Backlog and To Do share 'open' status, differentiate by some other criteria if needed
        // For simplicity, let's assume 'open' issues are either backlog or todo based on some internal logic
        // Here, we'll just return all 'open' issues for both backlog and todo columns
        return issue.status === "open";
      }
      return issue.status === columnStatus;
    });

    if (searchQuery) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((issue) => issue.status === filterStatus);
    }

    return filtered;
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const movedIssue = issues.find((issue) => issue.id === draggableId);
    if (movedIssue) {
      const newStatus = initialColumns.find(
        (col) => col.id === destination.droppableId,
      )?.status;
      if (newStatus && newStatus !== movedIssue.status) {
        onIssueUpdate(movedIssue.id, newStatus);
      }
    }
  };

  const getPriorityColor = (priority: Issue["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
        <div className="flex space-x-2">
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
          {/* Filter dropdown could be added here */}
          <Button onClick={onAddIssue} className="bg-brand-500 hover:bg-brand-600">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Issue
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 space-x-4 overflow-x-auto">
          {initialColumns.map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col w-80 bg-gray-700 rounded-lg shadow-md p-3 flex-shrink-0"
                >
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                    {column.title}
                    <Badge className="ml-2 bg-gray-600 text-gray-200">
                      {getIssuesForColumn(column.status).length}
                    </Badge>
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {getIssuesForColumn(column.status).map((issue, index) => (
                      <Draggable draggableId={issue.id} index={index} key={issue.id}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-600 text-white shadow-sm border-none"
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base font-medium">
                                {issue.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-gray-300">
                              <p className="mb-2 line-clamp-2">
                                {issue.description || "No description provided."}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <Badge
                                  className={cn(
                                    "capitalize",
                                    getPriorityColor(issue.priority),
                                  )}
                                >
                                  {issue.priority}
                                </Badge>
                                {issue.assignedToAgentId && (
                                  <span className="text-gray-400">
                                    Assigned
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
