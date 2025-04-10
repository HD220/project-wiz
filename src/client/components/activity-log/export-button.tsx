import React from "react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onExport: () => void;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full mt-2"
      onClick={onExport}
    >
      Exportar Histórico
    </Button>
  );
}