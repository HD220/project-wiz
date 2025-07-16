// Mock documentation data

export interface DocFile {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: DocFile[];
  content?: string;
}

export const mockDocs: DocFile[] = [
  {
    id: "1",
    name: "README.md",
    path: "/docs/README.md",
    type: "file",
    content: `# Project Wiz Documentation

Welcome to the Project Wiz documentation! This is your comprehensive guide to understanding and using the Project Wiz platform.

## Getting Started

Project Wiz is an AI-powered project management tool that helps you:

- Manage projects with intelligent agents
- Automate development workflows
- Collaborate with AI assistants
- Track progress with Kanban boards

## Quick Start

1. Create a new project
2. Add AI agents to your team
3. Configure your development environment
4. Start collaborating with AI!

## Support

Need help? Check out our [FAQ](./faq.md) or contact support.`,
  },
  {
    id: "2",
    name: "Getting Started",
    path: "/docs/getting-started",
    type: "folder",
    children: [
      {
        id: "3",
        name: "installation.md",
        path: "/docs/getting-started/installation.md",
        type: "file",
        content: `# Installation Guide

## System Requirements

- Node.js 18 or higher
- npm or yarn package manager
- Git

## Installation Steps

1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Run the application`,
      },
    ],
  },
];
