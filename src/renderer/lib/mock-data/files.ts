import type { FileTreeItem } from "./types";

export const mockFileTree: FileTreeItem[] = [
  {
    id: "root",
    name: "project-wiz",
    type: "directory",
    path: "root",
    children: [
      {
        id: "src",
        name: "src",
        type: "directory",
        path: "root/src",
        children: [
          {
            id: "main",
            name: "main",
            type: "directory",
            path: "root/src/main",
            children: [
              {
                id: "main-ts",
                name: "main.ts",
                type: "file",
                path: "root/src/main/main.ts",
                size: 1024,
                modified: new Date(),
              },
              {
                id: "app",
                name: "app",
                type: "directory",
                path: "root/src/main/app",
                children: [
                  {
                    id: "app-ts",
                    name: "app.ts",
                    type: "file",
                    path: "root/src/main/app/app.ts",
                    size: 2048,
                    modified: new Date(),
                  },
                ],
              },
            ],
          },
          {
            id: "renderer",
            name: "renderer",
            type: "directory",
            path: "root/src/renderer",
            children: [
              {
                id: "app-tsx",
                name: "app.tsx",
                type: "file",
                path: "root/src/renderer/app.tsx",
                size: 4096,
                modified: new Date(),
              },
              {
                id: "components",
                name: "components",
                type: "directory",
                path: "root/src/renderer/components",
                children: [
                  {
                    id: "button-tsx",
                    name: "button.tsx",
                    type: "file",
                    path: "root/src/renderer/components/button.tsx",
                    size: 1536,
                    modified: new Date(),
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "package-json",
        name: "package.json",
        type: "file",
        path: "root/package.json",
        size: 3072,
        modified: new Date(),
      },
      {
        id: "readme-md",
        name: "README.md",
        type: "file",
        path: "root/README.md",
        size: 2560,
        modified: new Date(),
      },
    ],
  },
];

export const fileExplorerPlaceholders = {
  fileTree: mockFileTree,
};
