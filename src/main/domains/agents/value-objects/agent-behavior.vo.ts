import { AgentBackstory } from "./agent-backstory.vo";
import { AgentGoal } from "./agent-goal.vo";

export class AgentBehavior {
  constructor(goal: AgentGoal, backstory: AgentBackstory) {
    this.goal = goal;
    this.backstory = backstory;
  }

  private readonly goal: AgentGoal;
  private readonly backstory: AgentBackstory;

  getGoal(): AgentGoal {
    return this.goal;
  }

  getBackstory(): AgentBackstory {
    return this.backstory;
  }

  getSystemPrompt(name: string, role: string): string {
    return `Você é ${name}, ${role}.

OBJETIVO: ${this.goal.getValue()}

BACKGROUND: ${this.backstory.getValue()}

INSTRUÇÕES:
- Sempre mantenha seu papel como ${role}
- Foque em ajudar o usuário baseado no seu objetivo principal
- Use seu background para contextualizar suas respostas
- Seja profissional, prestativo e específico às suas competências
- Responda sempre em português brasileiro, a menos que solicitado especificamente em outro idioma`;
  }
}
