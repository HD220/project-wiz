import React, { useEffect, useState } from 'react';
import { PromptData, PromptRepository } from '../../../core/infrastructure/db/promptRepository';
import { PromptList } from './PromptList';
import { PromptForm } from './PromptForm';
import {
  exportPromptsWithChecksum,
  validateImportedPackage,
  generateShareToken,
  ExportedPromptPackage,
} from '../../../core/application/services/prompt-share-service';

/**
 * Mapeia um prompt bruto do banco para PromptData tipado.
 */
function mapDbPromptToPromptData(p: any): PromptData {
  return {
    id: p.id,
    name: p.name,
    content: p.content,
    isDefault: p.isDefault === 1,
    isShared: p.isShared === 1,
    sharedLink: p.sharedLink ?? undefined,
    variables: (p.variables || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      type: (['string', 'number', 'boolean', 'date', 'enum'].includes(v.type) ? v.type : 'string') as 'string' | 'number' | 'boolean' | 'date' | 'enum',
      required: v.required === 1,
      defaultValue: v.defaultValue,
      options: v.options,
    })),
  };
}

/**
 * Container principal para gerenciamento de prompts personalizados.
 * Controla a listagem, criação, edição e exclusão.
 */
export function PromptManager() {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const result = await PromptRepository.listPrompts();
      const mapped = result.map(mapDbPromptToPromptData);
      setPrompts(mapped);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar prompts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleCreate = () => {
    setSelectedPrompt(null);
    setMode('create');
  };

  const handleEdit = (prompt: PromptData) => {
    setSelectedPrompt(prompt);
    setMode('edit');
  };

  const handleSave = async (data: PromptData) => {
    setLoading(true);
    try {
      if (mode === 'create') {
        await PromptRepository.createPrompt(data);
        setSuccessMessage('Prompt criado com sucesso.');
      } else if (mode === 'edit' && data.id) {
        await PromptRepository.updatePrompt(data.id, data);
        setSuccessMessage('Prompt atualizado com sucesso.');
      }
      setMode('list');
      loadPrompts();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar prompt.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await PromptRepository.deletePrompt(id);
      setSuccessMessage('Prompt excluído com sucesso.');
      loadPrompts();
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir prompt.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreDefaults = async () => {
    setLoading(true);
    try {
      await PromptRepository.restoreDefaultPrompts();
      setSuccessMessage('Prompts padrão restaurados.');
      loadPrompts();
    } catch (err) {
      console.error(err);
      setError('Erro ao restaurar prompts padrão.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPrompts = async () => {
    setLoading(true);
    try {
      const data = await PromptRepository.exportPrompts();
      const mapped = data.map(mapDbPromptToPromptData);
      const pkg = exportPromptsWithChecksum(mapped);
      const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'prompts-export.json';
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMessage('Exportação realizada com sucesso.');
    } catch (err) {
      console.error(err);
      setError('Erro ao exportar prompts.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportPrompts = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async () => {
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        const text = await file.text();
        let pkg: ExportedPromptPackage;
        try {
          pkg = JSON.parse(text);
        } catch {
          setError('Arquivo inválido.');
          return;
        }
        try {
          validateImportedPackage(pkg);
        } catch (e: any) {
          setError(e.message);
          return;
        }
        setLoading(true);
        try {
          await PromptRepository.importPrompts(pkg.prompts);
          setSuccessMessage('Importação realizada com sucesso.');
          loadPrompts();
        } catch (err) {
          console.error(err);
          setError('Erro ao importar prompts.');
        } finally {
          setLoading(false);
        }
      };
      input.click();
    } catch (err) {
      console.error(err);
      setError('Erro ao importar prompts.');
    }
  };

  const handleGenerateShareLink = async (prompt: PromptData) => {
    if (!prompt.id) {
      setError('Prompt inválido.');
      return;
    }
    setLoading(true);
    try {
      const token = generateShareToken();
      await PromptRepository.updatePrompt(prompt.id, {
        isShared: true,
        sharedLink: token,
      });
      setSuccessMessage('Link gerado com sucesso.');
      loadPrompts();
    } catch (err) {
      console.error(err);
      setError('Erro ao gerar link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {successMessage && <div className="text-green-500 mb-2">{successMessage}</div>}
      {loading && <div>Carregando...</div>}

      {mode === 'list' && (
        <PromptList
          prompts={prompts}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestoreDefaults={handleRestoreDefaults}
          onExport={handleExportPrompts}
          onImport={handleImportPrompts}
          onGenerateLink={handleGenerateShareLink}
        />
      )}

      {(mode === 'create' || mode === 'edit') && (
        <PromptForm
          prompt={selectedPrompt}
          onSave={handleSave}
          onCancel={() => setMode('list')}
        />
      )}
    </div>
  );
}