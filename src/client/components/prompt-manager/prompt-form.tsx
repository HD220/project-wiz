import React, { useEffect, useState } from 'react';
import { PromptUI, VariableUI } from '../../types/prompt';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { VariableEditor } from './variable-editor';
import { PromptPreview } from './prompt-preview';

interface PromptFormProps {
  prompt: PromptUI | null;
  onSave: (prompt: PromptUI) => void;
  onCancel: () => void;
}

export function PromptForm({ prompt, onSave, onCancel }: PromptFormProps) {
  const [name, setName] = useState(prompt?.name || '');
  const [description, setDescription] = useState(prompt?.description || '');
  const [content, setContent] = useState(prompt?.content || '');
  const [variables, setVariables] = useState<VariableUI[]>(prompt?.variables || []);
  const [values, setValues] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(prompt?.name || '');
    setDescription(prompt?.description || '');
    setContent(prompt?.content || '');
    setVariables(prompt?.variables || []);
    setValues({});
    setError(null);
  }, [prompt]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    if (!content.trim()) {
      setError('O conteúdo do prompt é obrigatório.');
      return;
    }

    const now = new Date();

    const data: PromptUI = {
      id: prompt?.id ?? '',
      name,
      description,
      content,
      variables,
      createdAt: prompt?.createdAt ?? now,
      updatedAt: now,
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
          placeholder="Optional description"
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