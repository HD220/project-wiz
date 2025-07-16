interface TaskCardDescriptionProps {
  description?: string;
}

export function TaskCardDescription({ description }: TaskCardDescriptionProps) {
  if (!description) return null;

  return (
    <p className="text-xs text-muted-foreground line-clamp-2">
      {description}
    </p>
  );
}