import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Checkbox } from '../../../../components/ui/checkbox';
import type { CreateAgentDto } from '../../../../shared/types/domains/agents/agent.types';

interface AddAgentAdvancedFieldsProps {
  formData: CreateAgentDto;
  updateField: (field: keyof CreateAgentDto, value: any) => void;
}

export function AddAgentAdvancedFields({ formData, updateField }: AddAgentAdvancedFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperatura</Label>
          <Input
            id="temperature"
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => updateField("temperature", parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            min="100"
            max="8000"
            value={formData.maxTokens}
            onChange={(e) => updateField("maxTokens", parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxIterations">Máximo de Iterações</Label>
        <Input
          id="maxIterations"
          type="number"
          min="1"
          max="50"
          value={formData.maxIterations}
          onChange={(e) => updateField("maxIterations", parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">Prompt do Sistema (Opcional)</Label>
        <Textarea
          id="systemPrompt"
          value={formData.systemPrompt}
          onChange={(e) => updateField("systemPrompt", e.target.value)}
          placeholder="Instruções adicionais para o agente..."
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verbose"
            checked={formData.verbose}
            onCheckedChange={(checked) => updateField("verbose", checked)}
          />
          <Label htmlFor="verbose">Modo verboso (logs detalhados)</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowDelegation"
            checked={formData.allowDelegation}
            onCheckedChange={(checked) => updateField("allowDelegation", checked)}
          />
          <Label htmlFor="allowDelegation">Permitir delegação para outros agentes</Label>
        </div>
      </div>
    </div>
  );
}