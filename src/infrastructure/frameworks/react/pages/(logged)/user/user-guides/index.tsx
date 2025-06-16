import { MarkdownView } from "@/components/markdown-render";
// ScrollArea might not be needed if MarkdownView handles its own scrolling or if page layout is simpler.
// Keeping it for now as it was in the original.
import { ScrollArea } from "@/components/ui/scroll-area";
import { createFileRoute } from "@tanstack/react-router";
import { userGuideContent } from "@/lib/placeholders"; // Import from placeholders

export const Route = createFileRoute("/(logged)/user/user-guides/")({
  component: UserGuidesPage, // Renamed component
});

export function UserGuidesPage() {
  return (
    // If MarkdownView takes full height and has its own scroll, ScrollArea might be redundant.
    // For now, structure remains similar to original.
    <ScrollArea className="h-[calc(100vh-theme(spacing.16))]"> {/* Example: Adjust height based on layout */}
      <div className="m-4 pb-4">
        <MarkdownView className="prose dark:prose-invert max-w-none">
          {userGuideContent}
        </MarkdownView>
      </div>
    </ScrollArea>
  );
}
