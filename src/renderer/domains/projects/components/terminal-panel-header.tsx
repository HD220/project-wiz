import { Plus, Minimize2, Settings } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface TerminalPanelHeaderProps {
  onToggleCollapse?: () => void;
  onAddTab: () => void;
}

export function TerminalPanelHeader({ onToggleCollapse, onAddTab }: TerminalPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Terminal</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddTab}>
          <Plus className="h-3 w-3" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Settings className="h-3 w-3" />
        </Button>
        
        {onToggleCollapse && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleCollapse}>
            <Minimize2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}