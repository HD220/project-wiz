import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const docFiles = [
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
    {
      id: 2,
      name: "API Overview",
      path: "/docs/api/README.md",
      lastUpdated: "2023-06-15T09:45:00",
      content: `# API Documentation

This document provides an overview of the API endpoints available in this project.

## Authentication

All API requests require authentication using a JWT token.

### Endpoints

- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me
- POST /api/auth/logout

## Users

User management endpoints.

### Endpoints

- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id`,
    },
    {
      id: 3,
      name: "Authentication API",
      path: "/docs/api/auth.md",
      lastUpdated: "2023-06-15T10:42:00",
      content: `# Authentication API

This document provides detailed information about the authentication API endpoints.

## Login

\`\`\`
POST /api/auth/login
\`\`\`

### Request Body

\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

### Response

\`\`\`json
{
  "token": "jwt.token.here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
\`\`\`

## Register

\`\`\`
POST /api/auth/register
\`\`\`

### Request Body

\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
\`\`\`

### Response

\`\`\`json
{
  "token": "jwt.token.here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
\`\`\``,
    },
    {
      id: 4,
      name: "User API",
      path: "/docs/api/users.md",
      lastUpdated: "2023-06-14T15:30:00",
      content: `# User API

This document provides detailed information about the user management API endpoints.

## Get All Users

\`\`\`
GET /api/users
\`\`\`

### Response

\`\`\`json
{
  "users": [
    {
      "id": 1,
      "email": "user1@example.com",
      "name": "John Doe"
    },
    {
      "id": 2,
      "email": "user2@example.com",
      "name": "Jane Smith"
    }
  ]
}
\`\`\`

## Get User by ID

\`\`\`
GET /api/users/:id
\`\`\`

### Response

\`\`\`json
{
  "user": {
    "id": 1,
    "email": "user1@example.com",
    "name": "John Doe"
  }
}
\`\`\``,
    },
    {
      id: 5,
      name: "Architecture Overview",
      path: "/docs/architecture.md",
      lastUpdated: "2023-06-13T11:20:00",
      content: `# Architecture Overview

This document provides an overview of the project's architecture.

## Components

The project is divided into the following components:

- **Frontend**: React application with TypeScript
- **Backend**: Node.js API with Express
- **Database**: PostgreSQL

## Data Flow

1. User interacts with the React frontend
2. Frontend makes API calls to the backend
3. Backend processes the request and interacts with the database
4. Backend returns the response to the frontend
5. Frontend updates the UI based on the response

## Deployment

The application is deployed using Docker containers on a Kubernetes cluster.`,
    },
  ]

  const filteredDocs = docFiles.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
  }

  const selectedFileContent = selectedFile ? docFiles.find((doc) => doc.path === selectedFile)?.content : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Export All
          </Button>
          <Button variant="outline" size="sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search documentation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Documentation Files</CardTitle>
            <CardDescription>Files in /docs directory</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1">
                {filteredDocs.map((doc) => (
                  <Button
                    key={doc.id}
                    variant={selectedFile === doc.path ? "secondary" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedFile(doc.path)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">{doc.path}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedFile ? docFiles.find((doc) => doc.path === selectedFile)?.name : "Select a file"}
            </CardTitle>
            {selectedFile && (
              <CardDescription>
                Last updated: {formatDate(docFiles.find((doc) => doc.path === selectedFile)?.lastUpdated || "")}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedFileContent ? (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
                    {selectedFileContent}
                  </pre>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p className="mt-2">Select a file to view its contents</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

