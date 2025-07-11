import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { FileText, Folder, FolderOpen, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/project/$projectId/docs/")({
  component: ProjectDocsPage,
});

interface DocFile {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: DocFile[];
  content?: string;
}

// Mock documentation structure
const mockDocs: DocFile[] = [
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
2. Configure your AI agents
3. Start chatting with your team
4. Track tasks on the Kanban board

## Features

### AI Agents
- **Code Review Agent**: Automatically reviews your code
- **Documentation Agent**: Helps write and maintain docs
- **Testing Agent**: Assists with test creation and execution

### Project Management
- Kanban boards for task tracking
- Real-time chat with agents
- File management and code analysis
- Git integration for version control

## Support

For help and support, check our community guidelines or contact the development team.
`,
  },
  {
    id: "2",
    name: "user",
    path: "/docs/user",
    type: "folder",
    children: [
      {
        id: "3",
        name: "getting-started.md",
        path: "/docs/user/getting-started.md",
        type: "file",
        content: `# Getting Started Guide

This guide will help you get up and running with Project Wiz quickly.

## Installation

1. Download the latest release
2. Install dependencies
3. Configure your environment

## First Steps

### Creating Your First Project

1. Click the "+" button in the projects sidebar
2. Enter your project name and description
3. Choose your initial agents
4. Start collaborating!

### Setting Up Agents

Agents are AI assistants that help with various tasks:

- **Assistant Agent**: General purpose helper
- **Code Reviewer**: Reviews code changes
- **Documenter**: Helps with documentation

### Using the Chat System

The chat system allows real-time communication with your agents:

- Type messages naturally
- Use @mentions to address specific agents
- Share code snippets and files
- Get instant feedback and suggestions
`,
      },
      {
        id: "4",
        name: "tutorials",
        path: "/docs/user/tutorials",
        type: "folder",
        children: [
          {
            id: "5",
            name: "first-project.md",
            path: "/docs/user/tutorials/first-project.md",
            type: "file",
            content: `# Creating Your First Project

Learn how to create and set up your first project in Project Wiz.

## Step 1: Project Creation

Click the "Create Project" button and fill in:
- Project name
- Description
- Initial repository (optional)

## Step 2: Agent Configuration

Choose which agents to add:
- Start with the Assistant Agent for general help
- Add specialized agents as needed

## Step 3: First Chat

Try saying hello to your agents:
\`\`\`
Hello! Can you help me understand this project structure?
\`\`\`

## Step 4: Task Management

Create your first task on the Kanban board:
1. Go to the Tasks section
2. Click "Add Task" 
3. Fill in details and assign to an agent
`,
          },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "developer",
    path: "/docs/developer",
    type: "folder",
    children: [
      {
        id: "7",
        name: "architecture.md",
        path: "/docs/developer/architecture.md",
        type: "file",
        content: `# System Architecture

Project Wiz follows a modern, modular architecture designed for scalability and maintainability.

## Overview

The system is built with:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Electron Main Process + Node.js
- **Database**: SQLite with Drizzle ORM
- **AI Integration**: OpenAI/DeepSeek APIs

## Core Components

### Agent Runtime
Manages AI agent lifecycle and execution:
\`\`\`typescript
class AgentRuntime {
  async executeTask(task: Task): Promise<Result> {
    // Agent execution logic
  }
}
\`\`\`

### CQRS Pattern
Commands and Queries are separated:
- Commands: Modify system state
- Queries: Read system state

### Event System
Real-time updates using event-driven architecture:
- Agent status changes
- Task updates
- Chat messages

## Data Flow

1. User action triggers command
2. Command handler processes request
3. Domain logic executes
4. Events are emitted
5. UI updates reactively
`,
      },
    ],
  },
];

export function ProjectDocsPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(mockDocs[0]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["2", "4", "6"])
  );

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderDocTree = (docs: DocFile[], level = 0) => {
    return docs.map((doc) => (
      <div key={doc.id} className="select-none">
        <Button
          variant={selectedDoc?.id === doc.id ? "secondary" : "ghost"}
          className={`w-full justify-start px-2 py-1 h-auto text-sm font-normal ${
            level > 0 ? `ml-${level * 4}` : ""
          }`}
          onClick={() => {
            if (doc.type === "folder") {
              toggleFolder(doc.id);
            } else {
              setSelectedDoc(doc);
            }
          }}
        >
          {doc.type === "folder" ? (
            expandedFolders.has(doc.id) ? (
              <FolderOpen className="w-4 h-4 mr-2 text-muted-foreground" />
            ) : (
              <Folder className="w-4 h-4 mr-2 text-muted-foreground" />
            )
          ) : (
            <File className="w-4 h-4 mr-2 text-muted-foreground" />
          )}
          <span className="truncate">{doc.name}</span>
        </Button>
        {doc.type === "folder" &&
          expandedFolders.has(doc.id) &&
          doc.children &&
          renderDocTree(doc.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="h-full">
      <PageTitle
        title="Documentos"
        icon={<FileText className="w-5 h-5 text-muted-foreground" />}
      />
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Documentation Tree */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <div className="h-full flex flex-col border-r">
            <div className="p-3 border-b">
              <h3 className="font-semibold text-sm">Documentação</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">{renderDocTree(mockDocs)}</div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Document Viewer */}
        <ResizablePanel defaultSize={75}>
          <div className="h-full flex flex-col">
            {selectedDoc ? (
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b bg-muted/30">
                    <h1 className="text-lg font-semibold">{selectedDoc.name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoc.path}
                    </p>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-6 max-w-4xl mx-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selectedDoc.content || ""}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Selecione um documento
                  </h3>
                  <p className="text-muted-foreground">
                    Escolha um arquivo da árvore de documentação para
                    visualizá-lo.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
