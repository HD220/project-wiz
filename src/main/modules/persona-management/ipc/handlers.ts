import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { PersonaService } from "../application/persona.service";
import { PersonaMapper } from "../persona.mapper";
import type {
  CreatePersonaDto,
  UpdatePersonaDto,
  PersonaDto,
  PersonaFilterDto,
  AddPersonaToProjectDto,
  RemovePersonaFromProjectDto,
} from "../../../../shared/types/persona.types";

export class PersonaIpcHandlers {
  constructor(
    private personaService: PersonaService,
    private personaMapper: PersonaMapper,
  ) {}

  registerHandlers(): void {
    ipcMain.handle("persona:create", this.handleCreatePersona.bind(this));
    ipcMain.handle("persona:list", this.handleListPersonas.bind(this));
    ipcMain.handle("persona:getById", this.handleGetPersonaById.bind(this));
    ipcMain.handle("persona:update", this.handleUpdatePersona.bind(this));
    ipcMain.handle("persona:delete", this.handleDeletePersona.bind(this));
    ipcMain.handle(
      "persona:listActive",
      this.handleListActivePersonas.bind(this),
    );
    ipcMain.handle(
      "persona:toggleStatus",
      this.handleTogglePersonaStatus.bind(this),
    );
    
    // Project-Persona relationship handlers
    ipcMain.handle(
      "persona:addToProject",
      this.handleAddPersonaToProject.bind(this),
    );
    ipcMain.handle(
      "persona:removeFromProject",
      this.handleRemovePersonaFromProject.bind(this),
    );
    ipcMain.handle(
      "persona:listByProject",
      this.handleListProjectPersonas.bind(this),
    );
    ipcMain.handle(
      "persona:listNotInProject",
      this.handleListPersonasNotInProject.bind(this),
    );
    ipcMain.handle(
      "persona:isInProject",
      this.handleIsPersonaInProject.bind(this),
    );
  }

  private async handleCreatePersona(
    event: IpcMainInvokeEvent,
    data: CreatePersonaDto,
  ): Promise<PersonaDto> {
    try {
      const persona = await this.personaService.createPersona(data);
      return this.personaMapper.toDto(persona);
    } catch (error) {
      throw new Error(`Falha ao criar persona: ${(error as Error).message}`);
    }
  }

  private async handleListPersonas(
    event: IpcMainInvokeEvent,
    filter?: PersonaFilterDto,
  ): Promise<PersonaDto[]> {
    try {
      const personas = await this.personaService.listPersonas(filter);
      return personas.map((persona) => this.personaMapper.toDto(persona));
    } catch (error) {
      throw new Error(`Falha ao listar personas: ${(error as Error).message}`);
    }
  }

  private async handleGetPersonaById(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<PersonaDto | null> {
    try {
      const persona = await this.personaService.getPersonaById(id);
      return persona ? this.personaMapper.toDto(persona) : null;
    } catch (error) {
      throw new Error(`Falha ao buscar persona: ${(error as Error).message}`);
    }
  }

  private async handleUpdatePersona(
    event: IpcMainInvokeEvent,
    data: UpdatePersonaDto,
  ): Promise<PersonaDto> {
    try {
      const persona = await this.personaService.updatePersona(data);
      return this.personaMapper.toDto(persona);
    } catch (error) {
      throw new Error(
        `Falha ao atualizar persona: ${(error as Error).message}`,
      );
    }
  }

  private async handleDeletePersona(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<void> {
    try {
      await this.personaService.deletePersona(id);
    } catch (error) {
      throw new Error(`Falha ao deletar persona: ${(error as Error).message}`);
    }
  }

  private async handleListActivePersonas(
    event: IpcMainInvokeEvent,
  ): Promise<PersonaDto[]> {
    try {
      console.log('[PersonaIPC] Handling listActive request...');
      const personas = await this.personaService.getActivePersonas();
      console.log('[PersonaIPC] Found active personas:', personas.length);
      const result = personas.map((persona) => this.personaMapper.toDto(persona));
      console.log('[PersonaIPC] Returning personas:', result);
      return result;
    } catch (error) {
      console.error('[PersonaIPC] Error listing active personas:', error);
      throw new Error(
        `Falha ao listar personas ativas: ${(error as Error).message}`,
      );
    }
  }

  private async handleTogglePersonaStatus(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<PersonaDto> {
    try {
      const persona = await this.personaService.togglePersonaStatus(id);
      return this.personaMapper.toDto(persona);
    } catch (error) {
      throw new Error(
        `Falha ao alterar status da persona: ${(error as Error).message}`,
      );
    }
  }

  // Project-Persona relationship handlers
  private async handleAddPersonaToProject(
    event: IpcMainInvokeEvent,
    data: AddPersonaToProjectDto,
  ): Promise<void> {
    try {
      await this.personaService.addPersonaToProject(data);
    } catch (error) {
      throw new Error(
        `Falha ao adicionar persona ao projeto: ${(error as Error).message}`,
      );
    }
  }

  private async handleRemovePersonaFromProject(
    event: IpcMainInvokeEvent,
    data: RemovePersonaFromProjectDto,
  ): Promise<void> {
    try {
      await this.personaService.removePersonaFromProject(data);
    } catch (error) {
      throw new Error(
        `Falha ao remover persona do projeto: ${(error as Error).message}`,
      );
    }
  }

  private async handleListProjectPersonas(
    event: IpcMainInvokeEvent,
    projectId: string,
  ): Promise<PersonaDto[]> {
    try {
      const personas = await this.personaService.getProjectPersonas(projectId);
      return personas.map((persona) => this.personaMapper.toDto(persona));
    } catch (error) {
      throw new Error(
        `Falha ao listar personas do projeto: ${(error as Error).message}`,
      );
    }
  }

  private async handleListPersonasNotInProject(
    event: IpcMainInvokeEvent,
    projectId: string,
  ): Promise<PersonaDto[]> {
    try {
      const personas = await this.personaService.getPersonasNotInProject(projectId);
      return personas.map((persona) => this.personaMapper.toDto(persona));
    } catch (error) {
      throw new Error(
        `Falha ao listar personas não vinculadas: ${(error as Error).message}`,
      );
    }
  }

  private async handleIsPersonaInProject(
    event: IpcMainInvokeEvent,
    projectId: string,
    personaId: string,
  ): Promise<boolean> {
    try {
      return await this.personaService.isPersonaInProject(projectId, personaId);
    } catch (error) {
      throw new Error(
        `Falha ao verificar persona no projeto: ${(error as Error).message}`,
      );
    }
  }
}
