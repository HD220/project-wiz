/**
 * Mock documentation files for development and testing purposes.
 * Each object represents a documentation file with metadata and content.
 */
import type { DocFile } from "../../shared/types/doc-file";

export const mockDocFiles: DocFile[] = [
  {
    id: 1,
    name: "README.md",
    path: "/docs/README.md",
    lastUpdated: "2023-06-15T10:30:00",
    content: `# Project Name

A description of your project goes here.

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Feature 1
- Feature 2
- Feature 3

## API Documentation

See the [API docs](/docs/api/README.md) for more information.`,
  },
  // Adicione outros mocks conforme necessário
];