import { useState, useCallback } from "react";
import type { PromptUI } from "../../types/prompt";
import { promptDataToUI, promptUIToData } from "../../types/prompt";
import { PromptRepository } from "../../../core/infrastructure/db/promptRepository";
import type { PromptData } from "../../../core/infrastructure/db/promptRepository";

function convertDbPromptToPromptData(dbPrompt: any): PromptData {
  return {
    id: dbPrompt.id,
    name: dbPrompt.name,
    content: dbPrompt.content,
    variables: (dbPrompt.variables ?? []).map((v: any) => ({
      name: v.name,
      type: typeof v.type === "string" && ["string", "number", "boolean", "date", "enum"].includes(v.type) ? v.type : "string",
      required: !!v.required,
      defaultValue: v.defaultValue,
    })),
  };
}

export function usePromptManager() {
  const [prompts, setPrompts] = useState<PromptUI[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptUI | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dbList = await PromptRepository.listPrompts();
      const uiList = dbList.map((dbPrompt: any) => promptDataToUI(convertDbPromptToPromptData(dbPrompt)));
      setPrompts(uiList);
      if (selectedPrompt) {
        const updatedSelected = uiList.find((p) => p.id === selectedPrompt.id) ?? null;
        setSelectedPrompt(updatedSelected);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [selectedPrompt]);

  const selectPrompt = useCallback((id: string) => {
    const found = prompts.find((p) => p.id === id) ?? null;
    setSelectedPrompt(found);
  }, [prompts]);

  const createPrompt = useCallback(async (prompt: Partial<PromptUI>) => {
    setLoading(true);
    setError(null);
    try {
      const newPromptData = promptUIToData({
        id: "",
        name: prompt.name ?? "",
        description: prompt.description,
        content: prompt.content ?? "",
        variables: prompt.variables ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await PromptRepository.createPrompt(newPromptData);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [reload]);

  const updatePrompt = useCallback(async (id: string, updates: Partial<PromptUI>) => {
    setLoading(true);
    setError(null);
    try {
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
      await PromptRepository.updatePrompt(id, updateData);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [reload]);

  const deletePrompt = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await PromptRepository.deletePrompt(id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [reload]);

  const restoreDefaults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await PromptRepository.restoreDefaultPrompts();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [reload]);

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