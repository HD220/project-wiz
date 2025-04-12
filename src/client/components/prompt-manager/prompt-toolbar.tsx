import React from 'react';

interface PromptToolbarProps {
  onCreate: () => void;
  onExport: () => void;
  onImport: () => void;
  onRestoreDefaults: () => void;
}

export function PromptToolbar({
  onCreate,
  onExport,
  onImport,
  onRestoreDefaults,
}: PromptToolbarProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button onClick={onCreate} className="px-3 py-1 border rounded">
        Criar Prompt
      </button>
      <button onClick={onExport} className="px-3 py-1 border rounded">
        Exportar
      </button>
      <button onClick={onImport} className="px-3 py-1 border rounded">
        Importar
      </button>
      <button onClick={onRestoreDefaults} className="px-3 py-1 border rounded">
        Restaurar Padrões
      </button>
    </div>
  );
}