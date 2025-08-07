import { BookOpen, MessageSquare, Users } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";

export function ResourcesSection() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <CardTitle className="text-base">Resources</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="ghost" size="sm" className="w-full justify-start h-8">
          <BookOpen className="size-3 mr-2" />
          Documentation
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start h-8">
          <Users className="size-3 mr-2" />
          Community
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start h-8">
          <MessageSquare className="size-3 mr-2" />
          Support
        </Button>
      </CardContent>
    </Card>
  );
}
