/**
 * Mock documentation files for development and testing purposes.
 * Each object represents a documentation file with metadata and content.
 */
export interface DocFile {
  id: number;
  name: string;
  path: string;
  lastUpdated: string;
  content: string;
}

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
];