import { Brain, Target, BookOpen } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import type { CreateAgentDto } from '../../../../shared/types/domains/agents/agent.types';

interface AddAgentBasicFieldsProps {
  formData: CreateAgentDto;
  updateField: (field: keyof CreateAgentDto, value: any) => void;
  llmProviders: any[];
}

export function AddAgentBasicFields({ formData, updateField, llmProviders }: AddAgentBasicFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Agente</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="ex: Analista de Código"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          Função/Especialidade
        </Label>
        <Input
          id="role"
          value={formData.role}
          onChange={(e) => updateField("role", e.target.value)}
          placeholder="ex: Senior Python Developer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal" className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          Objetivo Principal
        </Label>
        <Textarea
          id="goal"
          value={formData.goal}
          onChange={(e) => updateField("goal", e.target.value)}
          placeholder="Descreva o objetivo principal deste agente..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="backstory" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          História de Fundo
        </Label>
        <Textarea
          id="backstory"
          value={formData.backstory}
          onChange={(e) => updateField("backstory", e.target.value)}
          placeholder="Contexto e experiência do agente..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Provedor LLM</Label>
        <Select value={formData.llmProviderId} onValueChange={(value) => updateField("llmProviderId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um provedor..." />
          </SelectTrigger>
          <SelectContent>
            {llmProviders.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name} ({provider.providerType})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}