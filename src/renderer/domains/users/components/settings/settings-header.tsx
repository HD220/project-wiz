import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  onSave: () => void;
}

export function SettingsHeader({ onSave }: SettingsHeaderProps) {
  return (
    <div className="flex justify-end mb-6">
      <Button onClick={onSave} className="gap-2">
        <Save className="w-4 h-4" />
        Salvar Alterações
      </Button>
    </div>
  );
}
