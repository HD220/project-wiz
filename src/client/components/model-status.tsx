export function ModelStatus() {
  return (
    <div className="bg-muted p-3 rounded-md">
      <div className="text-sm font-medium">Active Model</div>
      <div className="text-xs text-muted-foreground mt-1">
        mistralai/Mistral-7B-v0.1
      </div>
      <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="bg-primary h-full"
          style={{ width: "45%" }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Memory: 45%</span>
        <span>4.5GB / 10GB</span>
      </div>
    </div>
  );
}