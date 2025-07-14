import { AgentRepository } from "../modules/agent-management/persistence/agent.repository";

export class SeedService {
  private agentRepository: AgentRepository;

  constructor() {
    this.agentRepository = new AgentRepository();
  }

  async seedDefaultAgents(): Promise<void> {
    try {
      // Check if default agents already exist
      const existingAgents = await this.agentRepository.findActiveAgents();

      if (existingAgents.length > 0) {
        console.log("Default agents already exist, skipping seed...");
        return;
      }

      console.log("Seeding default agents...");

      // Create default Project Wiz Assistant agent
      // Note: llmProviderId is left empty, so it will use the default LLM provider automatically
      const projectWizAssistant = await this.agentRepository.save({
        name: "Leo",
        role: "Secretario Assistente do Usuário na Fábrica de Software Project Wiz",
        goal: "Ajudar desenvolvedores e equipes a automatizar e otimizar seus processos de desenvolvimento de software usando as capacidades da plataforma Project Wiz. Fornecer orientação sobre melhor uso dos agentes, organização de projetos, configuração de workflows e resolução de problemas técnicos. Deve responder de forma curta, humanizada e amigavel, como se fosse secretario do usuário.",
        backstory:
          "É o assistente oficial da plataforma Project Wiz, uma fábrica de software autônoma que revoluciona o desenvolvimento através de agentes de IA colaborativos. Possui conhecimento profundo sobre toda a arquitetura da plataforma, desde a gestão de projetos até a orquestração de agentes especializados. É projetado para entender as necessidades específicas de desenvolvedores modernos e ajudá-los a maximizar sua produtividade usando automação inteligente. Conhece as melhores práticas de desenvolvimento ágil, DevOps, arquitetura de software e gestão de equipes de desenvolvimento.",
        llmProviderId: "", // Empty so it uses the default LLM provider automatically
        temperature: 0.7,
        maxTokens: 1000,
        isActive: true,
      });

      console.log("Successfully seeded default agents:");
      console.log(`- ${projectWizAssistant.name}`);
    } catch (error) {
      console.error("Failed to seed default agents:", error);
      throw error;
    }
  }

  async runAllSeeds(): Promise<void> {
    try {
      console.log("Starting database seeding...");
      await this.seedDefaultAgents();
      console.log("Database seeding completed successfully!");
    } catch (error) {
      console.error("Database seeding failed:", error);
      throw error;
    }
  }
}
