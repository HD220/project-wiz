import { ChannelRepository } from "../persistence/repository";
import { Channel } from "../domain/channel.entity";
import { ChannelMapper } from "../channel.mapper";
import type { 
  CreateChannelDto, 
  UpdateChannelDto, 
  ChannelFilterDto 
} from "../../../../shared/types/channel.types";

export class ChannelService {
  constructor(
    private repository: ChannelRepository,
    private mapper: ChannelMapper,
  ) {}

  async createChannel(data: CreateChannelDto): Promise<Channel> {
    // Validação do nome
    const nameValidation = Channel.validateName(data.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.error);
    }

    // Validação da descrição
    const descValidation = Channel.validateDescription(data.description);
    if (!descValidation.isValid) {
      throw new Error(descValidation.error);
    }

    // Normalizar nome
    const normalizedName = Channel.normalizeName(data.name);

    // Verificar se já existe canal com esse nome no projeto
    const nameExists = await this.repository.existsByNameInProject(
      normalizedName, 
      data.projectId
    );
    
    if (nameExists) {
      throw new Error("Já existe um canal com este nome neste projeto");
    }

    // Criar dados para persistência
    const channelData = {
      name: normalizedName,
      description: data.description?.trim() || undefined,
      type: data.type,
      projectId: data.projectId,
      isPrivate: data.isPrivate || false,
      createdBy: data.createdBy,
    };

    // Salvar no banco
    const saved = await this.repository.save(channelData);
    return this.mapper.toDomain(saved);
  }

  async listChannels(filter?: ChannelFilterDto): Promise<Channel[]> {
    const schemas = await this.repository.findMany({
      ...filter,
      isArchived: false, // Por padrão, não mostrar arquivados
    });
    return schemas.map(schema => this.mapper.toDomain(schema));
  }

  async listChannelsByProject(projectId: string): Promise<Channel[]> {
    return this.listChannels({ projectId });
  }

  async getChannelById(id: string): Promise<Channel | null> {
    const schema = await this.repository.findById(id);
    return schema ? this.mapper.toDomain(schema) : null;
  }

  async updateChannel(data: UpdateChannelDto): Promise<Channel> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Canal não encontrado");
    }

    if (existing.isArchived) {
      throw new Error("Não é possível editar canal arquivado");
    }

    // Validar nome se fornecido
    if (data.name !== undefined) {
      const nameValidation = Channel.validateName(data.name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.error);
      }

      const normalizedName = Channel.normalizeName(data.name);
      
      // Verificar se novo nome já existe (excluindo o próprio canal)
      const nameExists = await this.repository.existsByNameInProject(
        normalizedName, 
        existing.projectId, 
        data.id
      );
      
      if (nameExists) {
        throw new Error("Já existe um canal com este nome neste projeto");
      }

      data.name = normalizedName;
    }

    // Validar descrição se fornecida
    if (data.description !== undefined) {
      const descValidation = Channel.validateDescription(data.description);
      if (!descValidation.isValid) {
        throw new Error(descValidation.error);
      }
    }

    const updated = await this.repository.update(data.id, data);
    return this.mapper.toDomain(updated);
  }

  async archiveChannel(id: string): Promise<Channel> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Canal não encontrado");
    }

    if (existing.type === 'general') {
      throw new Error("Não é possível arquivar o canal geral");
    }

    if (existing.isArchived) {
      throw new Error("Canal já está arquivado");
    }

    const archived = await this.repository.archive(id);
    return this.mapper.toDomain(archived);
  }

  async deleteChannel(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Canal não encontrado");
    }

    if (existing.type === 'general') {
      throw new Error("Não é possível deletar o canal geral");
    }

    await this.repository.delete(id);
  }

  async createDefaultChannelForProject(projectId: string, createdBy: string): Promise<Channel> {
    // Verificar se já existe canal geral
    const existing = await this.repository.findMany({
      projectId,
      type: 'general',
      isArchived: false,
    });

    if (existing.length > 0) {
      return this.mapper.toDomain(existing[0]);
    }

    // Criar canal geral padrão
    const generalChannel = Channel.createGeneral(projectId, createdBy);
    const saved = await this.repository.save(generalChannel.toPersistence());
    return this.mapper.toDomain(saved);
  }
}