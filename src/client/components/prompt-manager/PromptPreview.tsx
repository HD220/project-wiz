import React, { useEffect, useState } from 'react';
import { Prompt } from '../../../core/domain/entities/prompt';
import { VariableData } from '../../../core/infrastructure/db/promptRepository';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

/**
 * Propriedades para o componente de pré-visualização do prompt.
 */
interface PromptPreviewProps {
  content: string;
  variables: VariableData[];
  values: Record<string, any>;
  onChangeValues: (values: Record<string, any>) => void;
}

/**
 * Componente que mostra a pré-visualização do prompt com variáveis aplicadas.
 */
export function PromptPreview({
  content,
  variables,
  values,
  onChangeValues,
}: PromptPreviewProps) {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const generatePreview = async () => {
      try {
        const { applyPrompt } = await import('../../../core/application/services/prompt-processor');
        const promptObj = {
          text: content,
          parameters: {} as Record<string, any>,
        };
        for (const v of variables) {
          promptObj.parameters[v.name] = v;
        }
        const result = applyPrompt(promptObj, values);
        setPreview(result);
      } catch (err) {
        console.error(err);
        setPreview('Erro ao gerar pré-visualização.');
      }
    };
    generatePreview();
  }, [content, variables, values]);

  /**
   * Atualiza o valor de uma variável.
   */
  const updateValue = (name: string, value: any) => {
    onChangeValues({ ...values, [name]: value });
  };

  return (
    <div className="space-y-2">
      {variables.map((v) => (
        <div key={v.name} className="flex gap-2 items-center">
          <label className="w-32">{v.name}</label>
          {v.type === 'string' && (
            <Input
              value={values[v.name] ?? ''}
              onChange={(e) => updateValue(v.name, e.target.value)}
            />
          )}
          {v.type === 'number' && (
            <Input
              type="number"
              value={values[v.name] ?? ''}
              onChange={(e) => updateValue(v.name, e.target.value)}
            />
          )}
          {v.type === 'boolean' && (
            <Checkbox
              checked={!!values[v.name]}
              onCheckedChange={(checked) => updateValue(v.name, !!checked)}
            />
          )}
          {v.type === 'date' && (
            <Input
              type="date"
              value={values[v.name] ?? ''}
              onChange={(e) => updateValue(v.name, e.target.value)}
            />
          )}
          {v.type === 'enum' && (
            <Select
              value={values[v.name] ?? ''}
              onValueChange={(val) => updateValue(v.name, val)}
            >
              {(v.options || []).map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          )}
        </div>
      ))}

      <div className="mt-4 p-2 border rounded bg-muted whitespace-pre-wrap">
        {preview}
      </div>
    </div>
  );
}