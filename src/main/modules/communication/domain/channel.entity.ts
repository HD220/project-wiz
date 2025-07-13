export class Channel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly projectId: string,
    public readonly createdBy: string,
    public readonly isPrivate: boolean = false,
    public readonly description?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  // Validações de lógica de negócio
  static validateName(name: string): { isValid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: "Nome do canal é obrigatório" };
    }

    if (name.length < 2) {
      return { isValid: false, error: "Nome deve ter pelo menos 2 caracteres" };
    }

    if (name.length > 50) {
      return { isValid: false, error: "Nome deve ter no máximo 50 caracteres" };
    }

    // Permitir apenas letras, números, hífens e underscores
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      return { isValid: false, error: "Nome pode conter apenas letras, números, hífens e underscores" };
    }

    // Não pode começar ou terminar com hífen ou underscore
    if (/^[-_]|[-_]$/.test(name)) {
      return { isValid: false, error: "Nome não pode começar ou terminar com hífen ou underscore" };
    }

    return { isValid: true };
  }

  static validateDescription(description?: string): { isValid: boolean; error?: string } {
    if (description && description.length > 500) {
      return { isValid: false, error: "Descrição deve ter no máximo 500 caracteres" };
    }
    return { isValid: true };
  }

  // Métodos de lógica de negócio
  canBeAccessedBy(userId: string): boolean {
    if (!this.isPrivate) return true;
    return this.createdBy === userId;
  }

  isEditable(): boolean {
    return true; // All channels are editable now
  }

  canBeDeleted(): boolean {
    return true; // All channels can be deleted
  }

  // Normalizar nome (sempre minúsculo, substituir espaços por hífens)
  static normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Factory methods
  static createGeneral(projectId: string, createdBy: string): Channel {
    return new Channel(
      '', // ID será gerado pelo banco
      'geral',
      projectId,
      createdBy,
      false,
      'Canal principal do projeto'
    );
  }

  static createCustom(name: string, projectId: string, createdBy: string, isPrivate: boolean = false, description?: string): Channel {
    return new Channel(
      '', // ID será gerado pelo banco
      Channel.normalizeName(name),
      projectId,
      createdBy,
      isPrivate,
      description
    );
  }

  // Converter para dados de persistência
  toPersistence() {
    return {
      id: this.id,
      name: this.name,
      projectId: this.projectId,
      createdBy: this.createdBy,
      isPrivate: this.isPrivate,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}