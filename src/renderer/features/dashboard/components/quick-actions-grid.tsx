import { Link } from "@tanstack/react-router";
import { Folder, MessageSquare, Settings, Zap } from "lucide-react";


export function QuickActionsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Link to="/user/agents">
        <Card className="group hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Zap className="size-3 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  Quick Start
                </p>
                <p className="text-xs text-muted-foreground">
                  Create your first agent
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <div className="group hover:bg-accent/50 transition-colors cursor-pointer">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Folder className="size-3 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">Projects</p>
                <p className="text-xs text-muted-foreground">
                  Manage workspaces
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="group hover:bg-accent/50 transition-colors cursor-pointer">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-green-500/10">
                <MessageSquare className="size-3 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  Conversations
                </p>
                <p className="text-xs text-muted-foreground">
                  Chat with AI
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Link to="/user/settings">
        <Card className="group hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-orange-500/10">
                <Settings className="size-3 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">Settings</p>
                <p className="text-xs text-muted-foreground">
                  Configure workspace
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
