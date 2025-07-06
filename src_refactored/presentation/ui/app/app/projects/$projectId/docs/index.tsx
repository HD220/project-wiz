import { createFileRoute } from "@tanstack/react-router";
import React from "react";

import { DocSidebar } from "@/ui/features/project/components/docs/DocSidebar";
import { DocViewer } from "@/ui/features/project/components/docs/DocViewer";

// Mock documentation structure and content
const mockDocsFileSystem: DocFolder = {
  type: "folder",
  children: {
    testFile: {
      type: "file",
      content: "Test content",
    },
  },
};

type DocFile = { type: "file"; content: string; nameOverride?: string };
type DocFolder = {
  type: "folder";
  children: Record<string, DocEntry>;
  nameOverride?: string;
};
type DocEntry = DocFile | DocFolder;

function ProjectDocsPage() {
  const [selectedFilePath, setSelectedFilePath] = React.useState<string[]>([
    "readmeMd",
  ]);

  const getFileContent = (pathSegments: string[]): string | null => {
    let currentChildren: Record<string, DocEntry> | undefined = mockDocsFileSystem.children;
    let currentEntry: DocEntry | undefined;

    for (const segment of pathSegments) {
      if (!currentChildren) return null;
      currentEntry = currentChildren[segment];

      if (!currentEntry) return null;

      if (currentEntry.type === "folder") {
        currentChildren = currentEntry.children;
      } else {
        currentChildren = undefined;
      }
    }
    return currentEntry && currentEntry.type === "file"
      ? currentEntry.content
      : null;
  };

  const currentFileContent = getFileContent(selectedFilePath);

  return (
    <div className="flex h-[calc(100vh-var(--header-height,150px))]">
      <DocSidebar
        mockDocsFileSystem={mockDocsFileSystem.children}
        selectedFilePath={selectedFilePath}
        setSelectedFilePath={setSelectedFilePath}
      />
      <DocViewer
        selectedFilePath={selectedFilePath}
        currentFileContent={currentFileContent}
      />
    </div>
  );
}

export const Route = createFileRoute("/app/projects/$projectId/docs/")({
  component: ProjectDocsPage,
});
