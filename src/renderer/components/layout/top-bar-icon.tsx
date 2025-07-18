import { Hash, MessageSquare, Home, Code } from "lucide-react";

export function getTopBarIcon(
  type: "channel" | "dm" | "page" | "project",
  icon?: React.ReactNode,
) {
  if (icon) return icon;

  switch (type) {
    case "channel":
      return <Hash className="w-5 h-5 text-muted-foreground" />;
    case "dm":
      return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
    case "project":
      return <Code className="w-5 h-5 text-muted-foreground" />;
    default:
      return <Home className="w-5 h-5 text-muted-foreground" />;
  }
}
