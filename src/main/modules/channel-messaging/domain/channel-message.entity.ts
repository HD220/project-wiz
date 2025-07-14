import type { ChannelMessageTypeEnum } from "../../../../shared/types/channel-message.types";

export class ChannelMessage {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly channelId: string,
    public readonly authorId: string,
    public readonly authorName: string,
    public readonly type: ChannelMessageTypeEnum,
    public readonly isEdited: boolean = false,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  // Validações de lógica de negócio
  static validateContent(content: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: "Conteúdo da mensagem é obrigatório" };
    }

    if (content.length > 4000) {
      return {
        isValid: false,
        error: "Mensagem deve ter no máximo 4000 caracteres",
      };
    }

    return { isValid: true };
  }

  static validateAuthorName(authorName: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!authorName || authorName.trim().length === 0) {
      return { isValid: false, error: "Nome do autor é obrigatório" };
    }

    if (authorName.length > 100) {
      return {
        isValid: false,
        error: "Nome do autor deve ter no máximo 100 caracteres",
      };
    }

    return { isValid: true };
  }

  // Métodos de lógica de negócio
  canBeEditedBy(userId: string): boolean {
    return this.authorId === userId && this.type !== "system";
  }

  canBeDeletedBy(userId: string): boolean {
    return this.authorId === userId && this.type !== "system";
  }

  isSystemMessage(): boolean {
    return this.type === "system";
  }

  isCodeMessage(): boolean {
    return this.type === "code";
  }

  isFileMessage(): boolean {
    return this.type === "file";
  }

  getDisplayContent(): string {
    if (this.type === "system") {
      return `🤖 ${this.content}`;
    }

    if (this.type === "code") {
      return `\`\`\`\n${this.content}\n\`\`\``;
    }

    return this.content;
  }

  // Sanitizar conteúdo (remover caracteres perigosos)
  static sanitizeContent(content: string): string {
    return content
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .substring(0, 4000); // Limitar tamanho
  }

  // Factory methods
  static createTextMessage(
    content: string,
    channelId: string,
    authorId: string,
    authorName: string,
    metadata?: Record<string, any>,
  ): ChannelMessage {
    return new ChannelMessage(
      "", // ID será gerado pelo banco
      ChannelMessage.sanitizeContent(content),
      channelId,
      authorId,
      authorName,
      "text",
      false,
      metadata,
    );
  }

  static createCodeMessage(
    code: string,
    language: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): ChannelMessage {
    return new ChannelMessage(
      "", // ID será gerado pelo banco
      code,
      channelId,
      authorId,
      authorName,
      "code",
      false,
      { language },
    );
  }

  static createSystemMessage(
    content: string,
    channelId: string,
    metadata?: Record<string, any>,
  ): ChannelMessage {
    return new ChannelMessage(
      "", // ID será gerado pelo banco
      content,
      channelId,
      "system",
      "Sistema",
      "system",
      false,
      metadata,
    );
  }

  static createFileMessage(
    fileName: string,
    fileUrl: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): ChannelMessage {
    return new ChannelMessage(
      "", // ID será gerado pelo banco
      `Arquivo: ${fileName}`,
      channelId,
      authorId,
      authorName,
      "file",
      false,
      { fileName, fileUrl },
    );
  }

  // Converter para dados de persistência
  toPersistence() {
    return {
      id: this.id,
      content: this.content,
      channelId: this.channelId,
      authorId: this.authorId,
      authorName: this.authorName,
      type: this.type,
      isEdited: this.isEdited,
      metadata: this.metadata ? JSON.stringify(this.metadata) : undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Criar a partir de dados de persistência
  static fromPersistence(data: any): ChannelMessage {
    return new ChannelMessage(
      data.id,
      data.content,
      data.channelId,
      data.authorId,
      data.authorName,
      data.type,
      data.isEdited,
      data.metadata ? JSON.parse(data.metadata) : undefined,
      data.createdAt,
      data.updatedAt,
    );
  }
}
