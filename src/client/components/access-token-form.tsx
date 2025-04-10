import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PermissionsList } from "@/components/permissions-list";

interface AccessTokenFormProps {
  accessToken: string;
  setAccessToken: (token: string) => void;
}

export function AccessTokenForm({
  accessToken,
  setAccessToken,
}: AccessTokenFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Access Token</CardTitle>
        <CardDescription>
          Provide a GitHub personal access token with appropriate permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="access-token">Personal Access Token</Label>
          <div className="flex">
            <Input
              id="access-token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              type="password"
              className="rounded-r-none"
            />
            <Button variant="outline" className="rounded-l-none">
              Show
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Token requires: repo, workflow, and read:org scopes
          </p>
        </div>

        <div className="space-y-2 pt-4">
          <h3 className="text-lg font-medium">Required Permissions</h3>
          <PermissionsList />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Token</Button>
      </CardFooter>
    </Card>
  );
}