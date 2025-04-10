import React, { useState } from 'react';
import { usePromptManager } from '../../hooks/prompt/usePromptManager';
import { usePromptShare } from '../../hooks/prompt/usePromptShare';
import { PromptStatus } from './PromptStatus';
import { PromptToolbar } from './PromptToolbar';
import { PromptContainer } from './PromptContainer';
import { PromptList } from './prompt-list';
import { PromptForm } from './prompt-form';
import type { PromptUI } from '../../types/prompt';
import { promptUIToData } from '../../types/prompt';

export function PromptManager() {
  const {
    prompts,
    selectedPrompt,
    loading,
    error,
    selectPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    restoreDefaults,
    reload,
  } = usePromptManager();

  const {
    exportPrompts,
    importPrompts,
    generateShareLink,
  } = usePromptShare();

  const [modo, setModo] = useState<'list' | 'create' | 'edit'>('list');

  return (
    <div className="p-4">
      <PromptStatus error={error} loading={loading} />

      <PromptToolbar
        onCreate={() => {
          selectPrompt('');
          setModo('create');
        }}
        onExport={() => exportPrompts(prompts)}
        onImport={async () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'application/json';
          input.onchange = async () => {
            if (!input.files || input.files.length === 0) return;
            const file = input.files[0];
            const text = await file.text();
            await importPrompts(text);
            reload();
          };
          input.click();
        }}
        onRestoreDefaults={async () => {
          await restoreDefaults();
          reload();
        }}
      />

      <PromptContainer>
        {modo === 'list' && (
          <PromptList
            prompts={prompts}
            onCreate={() => {
              selectPrompt('');
              setModo('create');
            }}
            onEdit={(prompt: PromptUI) => {
              selectPrompt(prompt.id ?? '');
              setModo('edit');
            }}
            onDelete={async (id: string) => {
              await deletePrompt(id);
              reload();
            }}
            onRestoreDefaults={async () => {
              await restoreDefaults();
              reload();
            }}
            onExport={() => exportPrompts(prompts)}
            onImport={async () => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/json';
              input.onchange = async () => {
                if (!input.files || input.files.length === 0) return;
                const file = input.files[0];
                const text = await file.text();
                await importPrompts(text);
                reload();
              };
              input.click();
            }}
            onGenerateLink={async (prompt: PromptUI) => {
              const token = generateShareLink();
              if (prompt.id) {
                await updatePrompt(prompt.id, {
                  ...prompt,
                  sharedLink: token,
                });
                reload();
              }
            }}
          />
        )}

        {(modo === 'create' || modo === 'edit') && (
          <PromptForm
            prompt={selectedPrompt}
            onSave={async (p: PromptUI) => {
              const data = promptUIToData(p);
              if (modo === 'create') {
                await createPrompt(data);
              } else if (modo === 'edit' && data.id) {
                await updatePrompt(data.id, data);
              }
              reload();
              setModo('list');
            }}
            onCancel={() => setModo('list')}
          />
        )}
      </PromptContainer>
    </div>
  );
}