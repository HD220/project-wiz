import { Badge } from "@/renderer/components/atoms/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/molecules/card";

export function SystemStatus() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">System Status</CardTitle>
        <CardDescription className="text-sm">
          Platform health and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 rounded-md bg-green-500/10">
          <span className="text-sm">API Status</span>
          <Badge
            variant="outline"
            className="bg-green-500/20 text-green-700"
          >
            Online
          </Badge>
        </div>
        <div className="flex items-center justify-between p-2 rounded-md bg-blue-500/10">
          <span className="text-sm">AI Models</span>
          <Badge
            variant="outline"
            className="bg-blue-500/20 text-blue-700"
          >
            Available
          </Badge>
        </div>
        <div className="flex items-center justify-between p-2 rounded-md bg-orange-500/10">
          <span className="text-sm">Response Time</span>
          <span className="text-sm font-medium">~1.2s</span>
        </div>
      </CardContent>
    </Card>
  );
}
