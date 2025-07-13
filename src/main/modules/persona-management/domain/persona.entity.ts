export class Persona {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly papel: string,
    public readonly goal: string,
    public readonly backstory: string,
    public readonly llmProviderId?: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static validateNome(nome: string): boolean {
    return nome.length >= 2 && nome.length <= 100;
  }

  static validatePapel(papel: string): boolean {
    return papel.length >= 2 && papel.length <= 200;
  }

  static validateGoal(goal: string): boolean {
    return goal.length >= 10 && goal.length <= 1000;
  }

  static validateBackstory(backstory: string): boolean {
    return backstory.length >= 10 && backstory.length <= 2000;
  }

  // Generate system prompt based on persona data
  getSystemPrompt(): string {
    return `Você é ${this.nome}, ${this.papel}.

OBJETIVO: ${this.goal}

BACKGROUND: ${this.backstory}

INSTRUÇÕES:
- Sempre mantenha seu papel como ${this.papel}
- Foque em ajudar o usuário baseado no seu objetivo principal
- Use seu background para contextualizar suas respostas
- Seja profissional, prestativo e específico às suas competências
- Responda sempre em português brasileiro, a menos que solicitado especificamente em outro idioma`;
  }
}