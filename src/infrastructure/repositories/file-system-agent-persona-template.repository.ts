// src/infrastructure/repositories/file-system-agent-persona-template.repository.ts
import fs from 'fs/promises';
import path from 'path';
import { AgentPersonaTemplate } from '../../core/domain/entities/agent/persona-template.types';
import { IAgentPersonaTemplateRepository } from '../../core/ports/repositories/agent-persona-template.repository';

export class FileSystemAgentPersonaTemplateRepository implements IAgentPersonaTemplateRepository {
  private templates: Map<string, AgentPersonaTemplate> = new Map();
  private rolesToIds: Map<string, string> = new Map(); // For faster findByRole

  constructor(private personasDir: string = path.join(process.cwd(), 'config/personas')) {}

  // Initialization method to be called explicitly after instantiation
  async init(): Promise<void> {
    try {
      const files = await fs.readdir(this.personasDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.personasDir, file);
          try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const template = JSON.parse(fileContent) as AgentPersonaTemplate;

            // Basic validation (can be enhanced with Zod)
            if (template.id && template.role && template.goal && template.backstory && Array.isArray(template.toolNames)) {
              if (this.templates.has(template.id)) {
                console.warn(\`FileSystemAgentPersonaTemplateRepository: Duplicate template ID '\${template.id}' found in \${file}. Skipping.\`);
                continue;
              }
              if (this.rolesToIds.has(template.role) && this.rolesToIds.get(template.role) !== template.id) {
                 console.warn(\`FileSystemAgentPersonaTemplateRepository: Duplicate template role '\${template.role}' (new ID: \${template.id}, existing ID: \${this.rolesToIds.get(template.role)}) found in \${file}. Prioritizing first encountered ID for role mapping or consider making roles unique.\`);
              } else if (!this.rolesToIds.has(template.role)) {
                 this.rolesToIds.set(template.role, template.id);
              }
              this.templates.set(template.id, template);
            } else {
              console.warn(\`FileSystemAgentPersonaTemplateRepository: Invalid template structure in \${file}. Skipping.\`);
            }
          } catch (e: any) {
            console.error(\`FileSystemAgentPersonaTemplateRepository: Error processing file \${filePath}: \${e.message}\`);
          }
        }
      }
    } catch (e: any) {
      console.error(\`FileSystemAgentPersonaTemplateRepository: Error reading personas directory \${this.personasDir}: \${e.message}\`);
      // If directory doesn't exist, this is acceptable for some scenarios, it will just be an empty repo.
      // However, for a production setup, you might want this to be a fatal error if personas are expected.
      if (e.code === 'ENOENT') { // Directory not found
        console.warn(\`FileSystemAgentPersonaTemplateRepository: Personas directory \${this.personasDir} not found. Attempting to create it. Repository will be empty initially.\`);
        try {
            await fs.mkdir(this.personasDir, { recursive: true }); // Create if not exists
            console.log(\`FileSystemAgentPersonaTemplateRepository: Created personas directory \${this.personasDir}.\`);
        } catch (mkdirError: any) {
            console.error(\`FileSystemAgentPersonaTemplateRepository: Failed to create personas directory \${this.personasDir}: \${mkdirError.message}\`);
            // Depending on requirements, might rethrow or proceed with an empty repository.
            // For now, proceed, and subsequent calls will use an empty map.
        }
      } else {
         throw e; // Rethrow other errors
      }
    }
    console.log(\`FileSystemAgentPersonaTemplateRepository initialized. Loaded \${this.templates.size} templates.\`);
  }

  async findById(id: string): Promise<AgentPersonaTemplate | null> {
    return this.templates.get(id) || null;
  }

  async findByRole(role: string): Promise<AgentPersonaTemplate | null> {
    const templateId = this.rolesToIds.get(role);
    if (templateId) {
      return this.templates.get(templateId) || null;
    }
    // Fallback scan if role not in map (e.g. due to duplicate role warning during init)
    // This ensures that if multiple templates have the same role, one of them can still be found by role.
    // The one mapped in rolesToIds (usually the first one encountered) is faster to retrieve.
    for (const template of this.templates.values()) {
      if (template.role === role) {
        console.warn(\`FileSystemAgentPersonaTemplateRepository: findByRole found role '\${role}' via fallback scan. Consider making roles unique or check initialization warnings.\`)
        return template;
      }
    }
    return null;
  }
}
