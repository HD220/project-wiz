import { createFileRoute } from "@tanstack/react-router";
import React from "react";

import { DocSidebar } from "@/ui/features/project/components/docs/DocSidebar";
import { DocViewer } from "@/ui/features/project/components/docs/DocViewer";

// Mock documentation structure and content
const mockDocsFileSystem = {
  readmeMd: {
    type: "file",
    content: `# Documentação do Projeto X

Bem-vindo à documentação oficial do Projeto X. Este documento serve como ponto de partida para entender a arquitetura, configuração e funcionalidades chave.

## Seções Principais
- Arquitetura do Sistema
- Guia de Instalação
- Casos de Uso

### Exemplo de Código
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`
`,
  },
  arquiteturaDir: {
    type: "folder",
    nameOverride: "arquitetura/",
    children: {
      visaoGeralMd: {
        nameOverride: "visao-geral.md",
        type: "file",
        content: "## Visão Geral da Arquitetura\n\nO sistema é modular...",
      },
      componentesMd: {
        nameOverride: "componentes.md",
        type: "file",
        content: "### Componentes Principais\n\n- Módulo A\n- Módulo B",
      },
    },
  },
  guiasDir: {
    type: "folder",
    nameOverride: "guias/",
    children: {
      instalacaoMd: {
        nameOverride: "instalacao.md",
        type: "file",
        content: "## Guia de Instalação\n\nSiga os passos...",
      },
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
    let currentEntry: DocEntry | Record<string, DocEntry> | undefined =
      mockDocsFileSystem;
    for (const segment of pathSegments) {
      if (!currentEntry) return null;

      if (
        typeof currentEntry === "object" &&
        "children" in currentEntry &&
        currentEntry.children
      ) {
        currentEntry = currentEntry.children[segment];
      } else if (
        typeof currentEntry === "object" &&
        !("type" in currentEntry) &&
        segment in currentEntry
      ) {
        currentEntry = (currentEntry as Record<string, DocEntry>)[segment];
      } else {
        return null;
      }
    }
    return currentEntry &&
      typeof currentEntry === "object" &&
      "type" in currentEntry &&
      currentEntry.type === "file"
      ? currentEntry.content
      : null;
  };

  const currentFileContent = getFileContent(selectedFilePath);

  return (
    <div className="flex h-[calc(100vh-var(--header-height,150px))]">
      <DocSidebar
        mockDocsFileSystem={mockDocsFileSystem}
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
