import type { DocFile } from "../../shared/types/doc-file";

const defaultReadmeContent = `# Project Name

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

See the [API docs](/docs/api/README.md) for more information.`;

function createMockDocFile(
  id: number,
  name: string,
  path: string,
  lastUpdated: string,
  content: string
): DocFile {
  return {
    id,
    name,
    path,
    lastUpdated,
    content,
  };
}

export const mockDocFiles: DocFile[] = [
  createMockDocFile(
    1,
    "README.md",
    "/docs/README.md",
    "2023-06-15T10:30:00",
    defaultReadmeContent
  ),
  createMockDocFile(
    2,
    "API.md",
    "/docs/api/API.md",
    "2023-07-20T14:00:00",
    "# API Documentation\n\nThis is the API documentation for the project."
  ),
  createMockDocFile(
    3,
    "CONTRIBUTING.md",
    "/docs/CONTRIBUTING.md",
    "2023-08-01T09:00:00",
    "# Contributing\n\nSee the contributing guidelines for more information."
  ),
];