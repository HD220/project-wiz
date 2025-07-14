import { Skeleton } from "@/components/ui/skeleton";

export function ConversationSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-12 px-4 flex items-center border-b border-border">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* Message bubbles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 3 === 0 ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex ${i % 3 === 0 ? "flex-row-reverse" : "flex-row"} items-start space-x-2 max-w-[70%]`}
            >
              {i % 3 !== 0 && (
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              )}
              <div className="space-y-1">
                <div
                  className={`rounded-lg p-3 ${i % 3 === 0 ? "bg-primary/10" : "bg-muted"}`}
                >
                  <Skeleton className="h-3 w-full mb-1" />
                  {Math.random() > 0.5 && <Skeleton className="h-3 w-2/3" />}
                </div>
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
