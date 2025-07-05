import { createFileRoute } from "@tanstack/react-router";
import React from "react";

import { DocSidebar } from "@/ui/features/project/components/docs/DocSidebar";
import { DocViewer } from "@/ui/features/project/components/docs/DocViewer";

// Mock documentation structure and content
const mockDocsFileSystem = {
  readmeMd: {
    type: "file" as const,
    content: `# Documentação do Projeto X

Bem-vindo à documentação oficial do Projeto X. Este documento serve como ponto de partida para entender a arquitetura, configuração e funcionalidades chave.

## Seções Principais
- Arquitetura do Sistema
- Guia de Instalação
- Casos de Uso

### Exemplo de Código
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, ${name}!\`;
}
\`\`\`
`,
  },
  arquiteturaDir: {
    type: "folder" as const,
    nameOverride: "arquitetura/",
    children: {
      visaoGeralMd: {
        nameOverride: "visao-geral.md",
        type: "file" as const,
        content: "## Visão Geral da Arquitetura\n\nO sistema é modular...",
      },
      componentesMd: {
        nameOverride: "componentes.md",
        type: "file" as const,
        content: "### Componentes Principais\n\n- Módulo A\n- Módulo B",
      },
    },
  },
  guiasDir: {
    type: "folder" as const,
    nameOverride: "guias/",
    children: {
      instalacaoMd: {
        nameOverride: "instalacao.md",
        type: "file" as const,
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
    let currentEntry: DocEntry | undefined = mockDocsFileSystem;
    for (const segment of pathSegments) {
      if (!currentEntry) return null;

      if (currentEntry.type === "folder") {
        currentEntry = currentEntry.children[segment];
      } else {
        return null;
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
