import { Badge } from "@/components/ui/badge.js";
import type { ModelStatus } from "./types.js";

interface ModelStatusBadgeProps {
  status: ModelStatus;
  isActive: boolean;
}

export function ModelStatusBadge({ status, isActive }: ModelStatusBadgeProps) {
  const variant =
    status === "downloaded" ? (isActive ? "default" : "secondary") : "outline";

  const label =
    status === "downloaded"
      ? isActive
        ? "Active"
        : "Downloaded"
      : "Not Downloaded";

  return <Badge variant={variant}>{label}</Badge>;
}
