import React from 'react';
import { VariableUI } from '../../types/prompt';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';

/**
 * Propriedades para o editor de variáveis.
 */
interface VariableEditorProps {
  variables: VariableUI[];
  onChange: (vars: VariableUI[]) => void;
}

/**
 * Editor dinâmico para variáveis do prompt.
 */
export function VariableEditor({ variables, onChange }: VariableEditorProps) {
  /**
   * Atualiza uma variável na lista.
   */
  const updateVariable = (index: number, updated: Partial<VariableUI>) => {
    const newVars = [...variables];
    newVars[index] = { ...newVars[index], ...updated };
    onChange(newVars);
  };

  /**
   * Remove uma variável da lista.
   */
  const removeVariable = (index: number) => {
    const newVars = variables.filter((_, i) => i !== index);
    onChange(newVars);
  };

  /**
   * Adiciona uma nova variável.
   */
  const addVariable = () => {
    onChange([
      ...variables,
      {
        name: '',
        type: 'string',
        required: false,
      },
    ]);
  };

  return (
    <div className="space-y-2">
      {variables.map((v, idx) => (
        <div key={idx} className="border rounded p-2 space-y-2">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Nome"
              value={v.name}
              onChange={(e) => updateVariable(idx, { name: e.target.value })}
            />
            <Select
              value={v.type}
              onValueChange={(val) =>
                updateVariable(idx, { type: val as VariableUI['type'] })
              }
            >
              <option value="string">Texto</option>
              <option value="number">Número</option>
              <option value="boolean">Booleano</option>
              <option value="date">Data</option>
              <option value="enum">Enum</option>
            </Select>
            <div className="flex items-center gap-1">
              <Checkbox
                checked={v.required}
                onCheckedChange={(checked) =>
                  updateVariable(idx, { required: !!checked })
                }
              />
              <span>Obrigatório</span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => removeVariable(idx)}
            >
              Remover
            </Button>
          </div>

          <div>
            <label className="block text-sm">Valor padrão</label>
            <Input
              value={v.defaultValue ?? ''}
              onChange={(e) => updateVariable(idx, { defaultValue: e.target.value })}
            />
          </div>

          {v.type === 'enum' && (
            <div>
              <label className="block text-sm">Opções (uma por linha)</label>
              <Textarea
                value={(v.options || []).join('\n')}
                onChange={(e) =>
                  updateVariable(idx, {
                    options: e.target.value.split('\n').filter((opt) => opt.trim() !== ''),
                  })
                }
              />
            </div>
          )}
        </div>
      ))}

      <Button onClick={addVariable}>Adicionar Variável</Button>
    </div>
  );
}