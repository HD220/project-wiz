import type { TerminalLine } from "./types";

export const mockTerminalLines: TerminalLine[] = [
  {
    id: "term-1",
    content: "$ npm install",
    type: "input",
    timestamp: new Date("2024-01-15T10:00:00Z"),
  },
  {
    id: "term-2",
    content: "Installing dependencies...",
    type: "output",
    timestamp: new Date("2024-01-15T10:00:01Z"),
  },
  {
    id: "term-3",
    content: "✓ Dependencies installed successfully",
    type: "output",
    timestamp: new Date("2024-01-15T10:00:10Z"),
  },
  {
    id: "term-4",
    content: "$ npm run dev",
    type: "input",
    timestamp: new Date("2024-01-15T10:01:00Z"),
  },
  {
    id: "term-5",
    content: "Starting development server...",
    type: "output",
    timestamp: new Date("2024-01-15T10:01:01Z"),
  },
  {
    id: "term-6",
    content: "Server running on http://localhost:3000",
    type: "output",
    timestamp: new Date("2024-01-15T10:01:05Z"),
  },
  {
    id: "term-7",
    content: "$ npm test",
    type: "input",
    timestamp: new Date("2024-01-15T10:02:00Z"),
  },
  {
    id: "term-8",
    content: "Running tests...",
    type: "output",
    timestamp: new Date("2024-01-15T10:02:01Z"),
  },
  {
    id: "term-9",
    content: "Error: Test failed",
    type: "error",
    timestamp: new Date("2024-01-15T10:02:05Z"),
  },
];
