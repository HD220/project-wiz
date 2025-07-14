import { useSyncExternalStore, useEffect, useMemo, useRef } from "react";
import { channelStore } from "../stores/channel.store";
import type {
  CreateChannelDto,
  UpdateChannelDto,
  ChannelFilterDto,
  ChannelDto,
} from "../../../../shared/types/channel.types";

export function useChannels(filter?: ChannelFilterDto) {
  const state = useSyncExternalStore(
    channelStore.subscribe,
    channelStore.getSnapshot,
    channelStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  // Auto-loading quando electronIPC fica disponível
  useEffect(() => {
    const loadInitialChannels = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await channelStore.loadChannels(filterRef.current);
      }
    };

    loadInitialChannels();
  }, []);

  // Mutations - memoizadas para evitar re-renders
  const mutations = useMemo(
    () => ({
      createChannel: (data: CreateChannelDto) =>
        channelStore.createChannel(data),

      updateChannel: (data: UpdateChannelDto) =>
        channelStore.updateChannel(data),

      archiveChannel: (id: string) => channelStore.archiveChannel(id),

      deleteChannel: (id: string) => channelStore.deleteChannel(id),

      setSelectedChannel: (channel: ChannelDto | null) =>
        channelStore.setSelectedChannel(channel),

      clearError: () => channelStore.clearError(),

      createDefaultChannel: (projectId: string, createdBy: string) =>
        channelStore.createDefaultChannel(projectId, createdBy),

      resetState: () => channelStore.resetState(),
    }),
    [],
  );

  // Queries - memoizadas
  const queries = useMemo(
    () => ({
      loadChannels: (newFilter?: ChannelFilterDto, forceReload?: boolean) =>
        channelStore.loadChannels(newFilter || filterRef.current, forceReload),

      loadChannelsByProject: (projectId: string, forceReload?: boolean) =>
        channelStore.loadChannelsByProject(projectId, forceReload),

      getChannelById: (id: string) => channelStore.getChannelById(id),

      refetch: () => channelStore.loadChannels(filterRef.current, true),
    }),
    [],
  );

  // Getters de conveniência - memoizados
  const getters = useMemo(
    () => ({
      getChannelsByProject: (projectId: string) =>
        channelStore.getChannelsByProject(projectId),

      getGeneralChannel: (projectId: string) =>
        channelStore.getGeneralChannel(projectId),
    }),
    [state.channels],
  );

  return {
    // Estado
    channels: state.channels,
    isLoading: state.isLoading,
    error: state.error,
    selectedChannel: state.selectedChannel,

    // Operações
    ...mutations,
    ...queries,
    ...getters,
  };
}

// Hook específico para canais de um projeto
export function useProjectChannels(projectId: string) {
  const state = useSyncExternalStore(
    channelStore.subscribe,
    channelStore.getSnapshot,
    channelStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const projectIdRef = useRef(projectId);

  // Resetar se o projeto mudou
  useEffect(() => {
    if (projectIdRef.current !== projectId) {
      projectIdRef.current = projectId;
      hasLoadedRef.current = false;
      channelStore.resetState();
    }
  }, [projectId]);

  // Auto-loading quando electronIPC fica disponível
  useEffect(() => {
    const loadProjectChannels = async () => {
      if (window.electronIPC && !hasLoadedRef.current && projectId) {
        hasLoadedRef.current = true;
        await channelStore.loadChannelsByProject(projectId);
      }
    };

    loadProjectChannels();
  }, [projectId]);

  // Filtrar canais apenas do projeto atual
  const projectChannels = useMemo(
    () => state.channels.filter((ch) => ch.projectId === projectId),
    [state.channels, projectId],
  );

  // Canal geral do projeto (first channel or one named 'general')
  const generalChannel = useMemo(
    () =>
      projectChannels.find((ch) => ch.name.toLowerCase() === "general") ||
      projectChannels[0] ||
      null,
    [projectChannels],
  );

  return {
    // Estado filtrado para o projeto
    channels: projectChannels,
    generalChannel,
    isLoading: state.isLoading,
    error: state.error,
    selectedChannel: state.selectedChannel,

    // Mutations específicas do projeto
    createChannel: (data: Omit<CreateChannelDto, "projectId">) =>
      channelStore.createChannel({ ...data, projectId }),

    updateChannel: channelStore.updateChannel,
    archiveChannel: channelStore.archiveChannel,
    deleteChannel: channelStore.deleteChannel,
    setSelectedChannel: channelStore.setSelectedChannel,
    clearError: channelStore.clearError,

    createDefaultChannel: (createdBy: string) =>
      channelStore.createDefaultChannel(projectId, createdBy),

    // Queries específicas do projeto
    loadChannels: (forceReload?: boolean) =>
      channelStore.loadChannelsByProject(projectId, forceReload),

    getChannelById: channelStore.getChannelById,
    refetch: () => channelStore.loadChannelsByProject(projectId, true),
  };
}
