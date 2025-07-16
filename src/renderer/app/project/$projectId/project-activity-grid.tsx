import { MessageSquare, FileText, GitBranch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectActivityGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary">
                <GitBranch className="w-3 h-3 mr-1" />
                commit
              </Badge>
              <span className="text-sm">Nova funcionalidade adicionada</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline">
                <MessageSquare className="w-3 h-3 mr-1" />
                chat
              </Badge>
              <span className="text-sm">Discussão sobre arquitetura</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="destructive">
                <FileText className="w-3 h-3 mr-1" />
                issue
              </Badge>
              <span className="text-sm">Bug reportado no módulo X</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Agentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Code Reviewer</span>
              <Badge variant="default">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Assistant</span>
              <Badge variant="default">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Developer</span>
              <Badge variant="secondary">Away</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
