import { Badge } from "@/components/ui/badge";

interface TaskCardLabelsProps {
  labels: string[];
}

export function TaskCardLabels({ labels }: TaskCardLabelsProps) {
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {labels.slice(0, 3).map((label) => (
        <Badge key={label} variant="outline" className="text-xs px-1.5 py-0.5">
          {label}
        </Badge>
      ))}
      {labels.length > 3 && (
        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
          +{labels.length - 3}
        </Badge>
      )}
    </div>
  );
}
