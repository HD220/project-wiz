import React, { useEffect, useState } from 'react';
import { PromptData, VariableData } from '../../../core/infrastructure/db/promptRepository';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { VariableEditor } from './VariableEditor';
import { PromptPreview } from './PromptPreview';

/**
 * Propriedades para o formulário de criação/edição de prompt.
 */
interface PromptFormProps {
  prompt: PromptData | null;
  onSave: (data: PromptData) => void;
  onCancel: () => void;
}

/**
 * Formulário para criar ou editar um prompt.
 */
export function PromptForm({ prompt, onSave, onCancel }: PromptFormProps) {
  const [name, setName] = useState(prompt?.name || '');
  const [description, setDescription] = useState(''); // UI only
  const [content, setContent] = useState(prompt?.content || '');
  const [variables, setVariables] = useState<VariableData[]>(prompt?.variables || []);
  const [values, setValues] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset ao trocar prompt
    setName(prompt?.name || '');
    setContent(prompt?.content || '');
    setVariables(prompt?.variables || []);
    setValues({});
    setError(null);
  }, [prompt]);

  /**
   * Valida e envia o formulário.
   */
  const handleSubmit = () => {
    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    if (!content.trim()) {
      setError('O conteúdo do prompt é obrigatório.');
      return;
    }
    // TODO: validar nome único (futuro)
    const data: PromptData = {
      id: prompt?.id,
      name,
      content,
      variables,
    };
    onSave(data);
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}

      <div>
        <label className="block font-semibold mb-1">Nome *</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label className="block font-semibold mb-1">Descrição</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição opcional (não salva ainda)"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Conteúdo do Prompt *</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Variáveis</label>
        <VariableEditor variables={variables} onChange={setVariables} />
      </div>

      <div>
        <label className="block font-semibold mb-1">Pré-visualização</label>
        <PromptPreview
          content={content}
          variables={variables}
          values={values}
          onChangeValues={setValues}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit}>Salvar</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}