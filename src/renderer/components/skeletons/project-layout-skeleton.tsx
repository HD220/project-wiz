import { Skeleton } from "@/components/ui/skeleton";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export function ProjectLayoutSkeleton() {
  return (
    <div className="flex h-full">
      <ResizablePanelGroup direction="horizontal">
        {/* Project Navigation Skeleton */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <div className="w-full bg-card border-r border-border flex flex-col h-full">
            {/* Header */}
            <div className="h-12 px-3 flex items-center justify-between border-b border-border">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>

            {/* Channel sections */}
            <div className="flex-1 p-3 space-y-4">
              {/* Text Channels */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-1">
                  <Skeleton className="h-8 w-full rounded" />
                  <Skeleton className="h-8 w-full rounded" />
                  <Skeleton className="h-8 w-full rounded" />
                </div>
              </div>

              {/* Voice Channels */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <div className="space-y-1">
                  <Skeleton className="h-8 w-full rounded" />
                  <Skeleton className="h-8 w-full rounded" />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Main Content Skeleton */}
        <ResizablePanel defaultSize={80}>
          <div className="flex flex-col h-full">
            {/* Top Bar Skeleton */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-border bg-background">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>

            {/* Content Area Skeleton */}
            <div className="flex-1 p-4 space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
