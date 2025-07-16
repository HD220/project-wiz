import type {
  ChannelDto,
  CreateChannelDto,
  UpdateChannelDto,
  ChannelFilterDto,
} from "../../../../shared/types/domains/projects/channel.types";

export const channelService = {
  async list(filter?: ChannelFilterDto): Promise<ChannelDto[]> {
    return window.electronIPC.invoke("channel:list", filter);
  },

  async listByProject(projectId: string): Promise<ChannelDto[]> {
    return window.electronIPC.invoke("channel:listByProject", { projectId });
  },

  async getById(id: string): Promise<ChannelDto | null> {
    return window.electronIPC.invoke("channel:getById", { id });
  },

  async create(data: CreateChannelDto): Promise<ChannelDto> {
    return window.electronIPC.invoke("channel:create", data);
  },

  async update(data: UpdateChannelDto): Promise<ChannelDto> {
    return window.electronIPC.invoke("channel:update", data);
  },

  async archive(id: string): Promise<void> {
    return window.electronIPC.invoke("channel:archive", { id });
  },

  async delete(id: string): Promise<void> {
    return window.electronIPC.invoke("channel:delete", { id });
  },

  async createDefault(
    projectId: string,
    createdBy: string,
  ): Promise<ChannelDto> {
    return window.electronIPC.invoke("channel:createDefault", {
      projectId,
      createdBy,
    });
  },
};
