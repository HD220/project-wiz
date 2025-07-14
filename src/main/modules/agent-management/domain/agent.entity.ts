export class Agent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly role: string,
    public readonly goal: string,
    public readonly backstory: string,
    public readonly llmProviderId: string,
    public readonly temperature: number = 0.7,
    public readonly maxTokens: number = 1000,
    public readonly isActive: boolean = true,
    public readonly isDefault: boolean = false,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  getSystemPrompt(): string {
    return `Você é ${this.name}, ${this.role}.

OBJETIVO: ${this.goal}

BACKGROUND: ${this.backstory}

INSTRUÇÕES:
- Sempre mantenha seu papel como ${this.role}
- Foque em ajudar o usuário baseado no seu objetivo principal
- Use seu background para contextualizar suas respostas
- Seja profissional, prestativo e específico às suas competências
- Responda sempre em português brasileiro, a menos que solicitado especificamente em outro idioma`;
  }

  // Validation methods
  static validateName(name: string): boolean {
    return name.length >= 2 && name.length <= 100;
  }

  static validateRole(role: string): boolean {
    return role.length >= 2 && role.length <= 200;
  }

  static validateGoal(goal: string): boolean {
    return goal.length >= 10 && goal.length <= 1000;
  }

  static validateBackstory(backstory: string): boolean {
    return backstory.length >= 10 && backstory.length <= 2000;
  }

  static validateLlmConfig(
    llmProviderId: string,
    temperature: number,
    maxTokens: number,
  ): { isValid: boolean; error?: string } {
    if (!llmProviderId) {
      return { isValid: false, error: "LLM Provider é obrigatório" };
    }

    if (temperature < 0 || temperature > 2) {
      return { isValid: false, error: "Temperatura deve estar entre 0 e 2" };
    }

    if (maxTokens < 1 || maxTokens > 10000) {
      return { isValid: false, error: "Max tokens deve estar entre 1 e 10000" };
    }

    return { isValid: true };
  }

  // Validate method for existing agent data
  static validate(data: {
    name: string;
    role: string;
    goal: string;
    backstory: string;
    llmProviderId: string;
    temperature: number;
    maxTokens: number;
  }): { isValid: boolean; error?: string } {
    if (!Agent.validateName(data.name)) {
      return {
        isValid: false,
        error: "Nome deve ter entre 2 e 100 caracteres",
      };
    }

    if (!Agent.validateRole(data.role)) {
      return {
        isValid: false,
        error: "Papel deve ter entre 2 e 200 caracteres",
      };
    }

    if (!Agent.validateGoal(data.goal)) {
      return {
        isValid: false,
        error: "Goal deve ter entre 10 e 1000 caracteres",
      };
    }

    if (!Agent.validateBackstory(data.backstory)) {
      return {
        isValid: false,
        error: "Backstory deve ter entre 10 e 2000 caracteres",
      };
    }

    const llmValidation = Agent.validateLlmConfig(
      data.llmProviderId,
      data.temperature,
      data.maxTokens,
    );
    if (!llmValidation.isValid) {
      return llmValidation;
    }

    return { isValid: true };
  }

  // Factory method for creating a new agent with validation
  static create(data: {
    name: string;
    role: string;
    goal: string;
    backstory: string;
    llmProviderId: string;
    temperature?: number;
    maxTokens?: number;
    isActive?: boolean;
    isDefault?: boolean;
  }): { isValid: boolean; agent?: Agent; error?: string } {
    // Validate all fields
    if (!Agent.validateName(data.name)) {
      return {
        isValid: false,
        error: "Nome deve ter entre 2 e 100 caracteres",
      };
    }

    if (!Agent.validateRole(data.role)) {
      return {
        isValid: false,
        error: "Papel deve ter entre 2 e 200 caracteres",
      };
    }

    if (!Agent.validateGoal(data.goal)) {
      return {
        isValid: false,
        error: "Objetivo deve ter entre 10 e 1000 caracteres",
      };
    }

    if (!Agent.validateBackstory(data.backstory)) {
      return {
        isValid: false,
        error: "Background deve ter entre 10 e 2000 caracteres",
      };
    }

    const temperature = data.temperature ?? 0.7;
    const maxTokens = data.maxTokens ?? 1000;

    const llmValidation = Agent.validateLlmConfig(
      data.llmProviderId,
      temperature,
      maxTokens,
    );
    if (!llmValidation.isValid) {
      return { isValid: false, error: llmValidation.error };
    }

    const agent = new Agent(
      "", // ID will be set by repository
      data.name,
      data.role,
      data.goal,
      data.backstory,
      data.llmProviderId,
      temperature,
      maxTokens,
      data.isActive ?? true,
      data.isDefault ?? false,
    );

    return { isValid: true, agent };
  }

  // Update methods
  updateIdentity(
    name?: string,
    role?: string,
    goal?: string,
    backstory?: string,
  ): Agent {
    const newName = name ?? this.name;
    const newRole = role ?? this.role;
    const newGoal = goal ?? this.goal;
    const newBackstory = backstory ?? this.backstory;

    if (name && !Agent.validateName(newName)) {
      throw new Error("Nome deve ter entre 2 e 100 caracteres");
    }

    if (role && !Agent.validateRole(newRole)) {
      throw new Error("Papel deve ter entre 2 e 200 caracteres");
    }

    if (goal && !Agent.validateGoal(newGoal)) {
      throw new Error("Objetivo deve ter entre 10 e 1000 caracteres");
    }

    if (backstory && !Agent.validateBackstory(newBackstory)) {
      throw new Error("Background deve ter entre 10 e 2000 caracteres");
    }

    return new Agent(
      this.id,
      newName,
      newRole,
      newGoal,
      newBackstory,
      this.llmProviderId,
      this.temperature,
      this.maxTokens,
      this.isActive,
      this.isDefault,
      this.createdAt,
      new Date(),
    );
  }

  updateLlmConfig(
    llmProviderId?: string,
    temperature?: number,
    maxTokens?: number,
  ): Agent {
    const newLlmProviderId = llmProviderId ?? this.llmProviderId;
    const newTemperature = temperature ?? this.temperature;
    const newMaxTokens = maxTokens ?? this.maxTokens;

    const validation = Agent.validateLlmConfig(
      newLlmProviderId,
      newTemperature,
      newMaxTokens,
    );
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return new Agent(
      this.id,
      this.name,
      this.role,
      this.goal,
      this.backstory,
      newLlmProviderId,
      newTemperature,
      newMaxTokens,
      this.isActive,
      this.isDefault,
      this.createdAt,
      new Date(),
    );
  }

  activate(): Agent {
    return new Agent(
      this.id,
      this.name,
      this.role,
      this.goal,
      this.backstory,
      this.llmProviderId,
      this.temperature,
      this.maxTokens,
      true,
      this.isDefault,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): Agent {
    return new Agent(
      this.id,
      this.name,
      this.role,
      this.goal,
      this.backstory,
      this.llmProviderId,
      this.temperature,
      this.maxTokens,
      false,
      this.isDefault,
      this.createdAt,
      new Date(),
    );
  }
}
