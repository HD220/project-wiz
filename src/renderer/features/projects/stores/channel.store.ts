import { create } from "zustand";

import type { ChannelDto } from "../../../../shared/types/projects/channel.types";

interface ChannelState {
  selectedChannel: ChannelDto | null;
  setSelectedChannel: (channel: ChannelDto | null) => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  selectedChannel: null,
  setSelectedChannel: (channel) => set({ selectedChannel: channel }),
}));
