import { useState, useCallback } from "react";
import type { PromptUI } from "../../types/prompt";
import { promptDataToUI, promptUIToData } from "../../types/prompt";
import type { IPromptRepository, PromptData } from "../../types/prompt-repository";
import { PromptService } from "../../services/prompt-service";
import { convertDbPromptToPromptData, withLoadingError } from "./prompt-utils";

export interface UsePromptManagerOptions {
  repository?: IPromptRepository;
  service?: PromptService;
}

export interface UsePromptManagerResult {
  prompts: PromptUI[];
  selectedPrompt: PromptUI | null;
  loading: boolean;
  error: string | null;
  selectPrompt: (id: string) => void;
  createPrompt: (prompt: Partial<PromptUI>) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<PromptUI>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  restoreDefaults: () => Promise<void>;
  reload: () => Promise<void>;
}

function getDefaultService(repository?: IPromptRepository): PromptService {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PromptRepository } = require("../../../core/infrastructure/db/promptRepository");
  return new PromptService(repository ?? PromptRepository);
}

export function usePromptManager(
  options: UsePromptManagerOptions = {}
): UsePromptManagerResult {
  const [prompts, setPrompts] = useState<PromptUI[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptUI | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = options.service ?? getDefaultService(options.repository);

  const loadPrompts = useCallback(async () => {
    return withLoadingError(setLoading, setError, async () => {
      const dbList = await service.listPrompts();
      const uiList = dbList.map((dbPrompt: PromptData) =>
        promptDataToUI(convertDbPromptToPromptData(dbPrompt))
      );
      setPrompts(uiList);
      return uiList;
    });
  }, [service]);

  const updateSelectedPrompt = useCallback(
    (uiList: PromptUI[], id?: string) => {
      const targetId = id ?? selectedPrompt?.id;
      if (!targetId) {
        setSelectedPrompt(null);
        return;
      }
      const found = uiList.find((p) => p.id === targetId) ?? null;
      setSelectedPrompt(found);
    },
    [selectedPrompt]
  );

  const reload = useCallback(async () => {
    const uiList = await loadPrompts();
    if (uiList) updateSelectedPrompt(uiList);
  }, [loadPrompts, updateSelectedPrompt]);

  const selectPrompt = useCallback(
    (id: string) => {
      updateSelectedPrompt(prompts, id);
    },
    [prompts, updateSelectedPrompt]
  );

  const createPrompt = useCallback(
    async (prompt: Partial<PromptUI>) => {
      await withLoadingError(setLoading, setError, async () => {
        const newPromptData = promptUIToData({
          id: "",
          name: prompt.name ?? "",
          description: prompt.description,
          content: prompt.content ?? "",
          variables: prompt.variables ?? [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await service.createPrompt(newPromptData);
        const uiList = await loadPrompts();
        if (uiList) updateSelectedPrompt(uiList, newPromptData.id);
      });
    },
    [service, loadPrompts, updateSelectedPrompt]
  );

  const updatePrompt = useCallback(
    async (id: string, updates: Partial<PromptUI>) => {
      await withLoadingError(setLoading, setError, async () => {
        const updateData: Partial<PromptData> = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.content !== undefined) updateData.content = updates.content;
        if (updates.variables !== undefined) {
          updateData.variables = updates.variables.map((v) => ({
            name: v.name,
            type: "string",
            required: false,
            defaultValue: v.defaultValue,
          }));
        }
        await service.updatePrompt(id, updateData);
        const uiList = await loadPrompts();
        if (uiList) updateSelectedPrompt(uiList, id);
      });
    },
    [service, loadPrompts, updateSelectedPrompt]
  );

  const deletePrompt = useCallback(
    async (id: string) => {
      await withLoadingError(setLoading, setError, async () => {
        await service.deletePrompt(id);
        const uiList = await loadPrompts();
        if (uiList) updateSelectedPrompt(uiList);
      });
    },
    [service, loadPrompts, updateSelectedPrompt]
  );

  const restoreDefaults = useCallback(async () => {
    await withLoadingError(setLoading, setError, async () => {
      await service.restoreDefaultPrompts();
      const uiList = await loadPrompts();
      if (uiList) updateSelectedPrompt(uiList);
    });
  }, [service, loadPrompts, updateSelectedPrompt]);

  return {
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
  };
}