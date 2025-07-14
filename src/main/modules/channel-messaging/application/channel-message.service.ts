import { ChannelMessageRepository } from "../persistence/channel-message.repository";
import { ChannelMessage } from "../domain/channel-message.entity";
import { ChannelMessageMapper } from "../channel-message.mapper";
import type {
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
  ChannelMessageFilterDto,
  ChannelMessagePaginationDto,
} from "../../../../shared/types/channel-message.types";

export class ChannelMessageService {
  constructor(
    private repository: ChannelMessageRepository,
    private mapper: ChannelMessageMapper,
  ) {}

  async createMessage(data: CreateChannelMessageDto): Promise<ChannelMessage> {
    // Validação do conteúdo
    const contentValidation = ChannelMessage.validateContent(data.content);
    if (!contentValidation.isValid) {
      throw new Error(contentValidation.error);
    }

    // Validação do nome do autor
    const authorValidation = ChannelMessage.validateAuthorName(data.authorName);
    if (!authorValidation.isValid) {
      throw new Error(authorValidation.error);
    }

    // Sanitizar conteúdo
    const sanitizedContent = ChannelMessage.sanitizeContent(data.content);

    // Criar dados para persistência
    const messageData = {
      content: sanitizedContent,
      channelId: data.channelId,
      authorId: data.authorId,
      authorName: data.authorName.trim(),
      type: data.type || "text",
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    };

    // Salvar no banco
    const saved = await this.repository.save(messageData);
    return this.mapper.toDomain(saved);
  }

  async listMessages(
    filter?: ChannelMessageFilterDto,
  ): Promise<ChannelMessage[]> {
    const schemas = await this.repository.findMany(filter);
    return schemas.map((schema) => this.mapper.toDomain(schema));
  }

  async listMessagesByChannel(
    channelId: string,
    limit = 50,
    offset = 0,
  ): Promise<ChannelMessagePaginationDto> {
    // Buscar mensagens
    const messages = await this.repository.findByChannel(
      channelId,
      limit + 1,
      offset,
    ); // +1 para verificar se tem mais

    // Verificar se tem mais mensagens
    const hasMore = messages.length > limit;
    const actualMessages = hasMore ? messages.slice(0, limit) : messages;

    // Converter para DTOs
    const messageDtos = this.mapper.schemaToDtoArray(actualMessages);

    return {
      messages: messageDtos,
      totalCount: actualMessages.length, // TODO: Implementar contagem real se necessário
      hasMore,
      nextOffset: hasMore ? offset + limit : undefined,
    };
  }

  async getLatestMessages(
    channelId: string,
    limit = 50,
  ): Promise<ChannelMessage[]> {
    const schemas = await this.repository.findLatestByChannel(channelId, limit);
    // Reverter ordem para cronológica (mais antiga primeiro)
    return schemas.reverse().map((schema) => this.mapper.toDomain(schema));
  }

  async getMessageById(id: string): Promise<ChannelMessage | null> {
    const schema = await this.repository.findById(id);
    return schema ? this.mapper.toDomain(schema) : null;
  }

  async updateMessage(data: UpdateChannelMessageDto): Promise<ChannelMessage> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Mensagem não encontrada");
    }

    // Verificar se pode editar (validar no service se necessário)
    // TODO: Adicionar validação de permissão baseada no usuário

    // Validar novo conteúdo se fornecido
    if (data.content !== undefined) {
      const contentValidation = ChannelMessage.validateContent(data.content);
      if (!contentValidation.isValid) {
        throw new Error(contentValidation.error);
      }
      data.content = ChannelMessage.sanitizeContent(data.content);
    }

    // Preparar metadados
    const updateData = {
      ...data,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    };

    const updated = await this.repository.update(data.id, updateData);
    return this.mapper.toDomain(updated);
  }

  async deleteMessage(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Mensagem não encontrada");
    }

    // TODO: Adicionar validação de permissão baseada no usuário

    await this.repository.delete(id);
  }

  async searchMessages(
    channelId: string,
    searchTerm: string,
    limit = 20,
  ): Promise<ChannelMessage[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const schemas = await this.repository.searchInChannel(
      channelId,
      searchTerm.trim(),
      limit,
    );
    return schemas.map((schema) => this.mapper.toDomain(schema));
  }

  async getLastMessage(channelId: string): Promise<ChannelMessage | null> {
    const schema = await this.repository.findLastMessageByChannel(channelId);
    return schema ? this.mapper.toDomain(schema) : null;
  }

  // Métodos de conveniência para diferentes tipos de mensagem
  async createTextMessage(
    content: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): Promise<ChannelMessage> {
    return this.createMessage({
      content,
      channelId,
      authorId,
      authorName,
      type: "text",
    });
  }

  async createCodeMessage(
    code: string,
    language: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): Promise<ChannelMessage> {
    return this.createMessage({
      content: code,
      channelId,
      authorId,
      authorName,
      type: "code",
      metadata: { language },
    });
  }

  async createSystemMessage(
    content: string,
    channelId: string,
    metadata?: Record<string, any>,
  ): Promise<ChannelMessage> {
    return this.createMessage({
      content,
      channelId,
      authorId: "system",
      authorName: "Sistema",
      type: "system",
      metadata,
    });
  }

  async createFileMessage(
    fileName: string,
    fileUrl: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): Promise<ChannelMessage> {
    return this.createMessage({
      content: `Arquivo: ${fileName}`,
      channelId,
      authorId,
      authorName,
      type: "file",
      metadata: { fileName, fileUrl },
    });
  }
}
