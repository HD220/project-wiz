// src/infrastructure/repositories/in-memory-agent-persona-template.repository.ts
import { AgentPersonaTemplate } from '../../core/domain/entities/agent/persona-template.types';
import { IAgentPersonaTemplateRepository } from '../../core/ports/repositories/agent-persona-template.repository';

// Example Persona Templates (these would likely come from config files or a DB in a real app)
const defaultPersonaTemplates: AgentPersonaTemplate[] = [
  {
    id: "FileSystemManager_v1",
    role: "FileSystem Manager",
    goal: "Manage files and directories efficiently and accurately based on instructions, including reading, writing, and organizing content.",
    backstory: "I am an AI assistant that specializes in all forms of file and directory manipulation.",
    toolNames: [
      'fileSystem.readFile',
      'fileSystem.writeFile',
      'fileSystem.listDirectory',
      'fileSystem.createDirectory',
      'fileSystem.removeFile',
      'fileSystem.removeDirectory',
      'fileSystem.moveFile',
      'fileSystem.moveDirectory',
      'annotation.save' // For logging its actions
    ],
  },
  {
    id: "CodeGenerator_v1",
    role: "Code Generator",
    goal: "Generate code snippets and simple programs based on requirements.",
    backstory: "I am an AI assistant specialized in generating code in various languages.",
    toolNames: [
      'fileSystem.writeFile', // To save generated code
      'annotation.save'
      // Potentially a 'codeExecution.runPython' tool in the future
    ],
  },
  {
    id: "GenericTaskProcessor_v1",
    role: "Generic Task Processor",
    goal: "Understand and execute general tasks using a wide array of available tools.",
    backstory: "I am a versatile AI assistant capable of tackling various problems by planning and using tools.",
    toolNames: [ // Example: Access to all tools previously defined
      'fileSystem.readFile', 'fileSystem.writeFile', 'fileSystem.listDirectory', 'fileSystem.createDirectory', 'fileSystem.removeFile', 'fileSystem.removeDirectory', 'fileSystem.moveFile', 'fileSystem.moveDirectory',
      'annotation.save', 'annotation.list', 'annotation.remove',
      'taskManager.listJobs', 'taskManager.saveJob', 'taskManager.removeJob'
    ],
  }
];

export class InMemoryAgentPersonaTemplateRepository implements IAgentPersonaTemplateRepository {
  private templates: Map<string, AgentPersonaTemplate>;

  constructor(initialTemplates: AgentPersonaTemplate[] = defaultPersonaTemplates) {
    this.templates = new Map();
    initialTemplates.forEach(template => {
      this.templates.set(template.id, template);
      // Optionally, index by role as well if findByRole is frequent and needs to be fast
      // For now, findByRole will iterate.
    });
    console.log(`InMemoryAgentPersonaTemplateRepository initialized with ${this.templates.size} templates.`);
  }

  async findById(id: string): Promise<AgentPersonaTemplate | null> {
    return this.templates.get(id) || null;
  }

  async findByRole(role: string): Promise<AgentPersonaTemplate | null> {
    for (const template of this.templates.values()) {
      if (template.role === role) {
        return template;
      }
    }
    return null;
  }

  // Example implementation if listAll was added to interface
  // async listAll(): Promise<AgentPersonaTemplate[]> {
  //   return Array.from(this.templates.values());
  // }

  // Method to add/update templates dynamically if needed (not in interface yet)
  public registerTemplate(template: AgentPersonaTemplate): void {
      this.templates.set(template.id, template);
      console.log(`InMemoryAgentPersonaTemplateRepository: Registered/updated template ID ${template.id} for role ${template.role}`);
  }
}
