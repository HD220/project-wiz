import { FileTreeItem } from "@/lib/placeholders";

export function getFilePreview(file: FileTreeItem): string {
  if (file.extension === "json") {
    return `{
  "name": "project-wiz",
  "version": "1.0.0",
  "description": "AI-powered project management tool",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}`;
  }

  if (file.extension === "md") {
    return `# ${file.name}

Este é um arquivo de documentação do projeto.

## Recursos

- Sistema de chat com agentes IA
- Gerenciamento de tarefas Kanban
- Explorador de arquivos integrado
- Terminal embutido`;
  }

  if (file.extension === "tsx") {
    return `import React from 'react';

export function ${file.name.replace(".tsx", "")}() {
  return (
    <div>
      <h1>Componente React</h1>
    </div>
  );
}`;
  }

  return "Conteúdo do arquivo será exibido aqui...";
}
