// src/core/domain/agent/agent-persona-template.vo.ts
import {
  AbstractValueObject,
  ValueObjectProps,
} from "@/core/common/value-objects/base.vo";

import { PersonaBackstory } from "./value-objects/persona/persona-backstory.vo";
import { PersonaGoal } from "./value-objects/persona/persona-goal.vo";
import { PersonaId } from "./value-objects/persona/persona-id.vo";
import { PersonaName } from "./value-objects/persona/persona-name.vo";
import { PersonaRole } from "./value-objects/persona/persona-role.vo";
import { ToolNames } from "./value-objects/persona/tool-names.vo";

// This interface matches the structure loaded from JSON by FileSystemAgentPersonaTemplateRepository
// and the type definition in the old persona-template.types.ts
interface AgentPersonaTemplateProps extends ValueObjectProps {
  id: PersonaId;
  name: PersonaName;
  role: PersonaRole;
  goal: PersonaGoal;
  backstory: PersonaBackstory | null;
  toolNames: ToolNames;
}

// AgentPersonaTemplate can be considered a complex Value Object or a Data Transfer Object (DTO)
// if it's primarily used to carry configuration data loaded from an external source (like JSON files).
// It doesn't have complex business logic or a lifecycle beyond being created/loaded.
export class AgentPersonaTemplate extends AbstractValueObject<AgentPersonaTemplateProps> {
  // Private constructor to enforce creation via static method
  private constructor(props: AgentPersonaTemplateProps) {
    super(props);
  }

  public static create(props: {
    id: PersonaId;
    name: PersonaName;
    role: PersonaRole;
    goal: PersonaGoal;
    backstory: PersonaBackstory | null;
    toolNames: ToolNames;
  }): AgentPersonaTemplate {
    // All props are VOs, so they are already validated upon their own creation.
    // No further validation needed here unless there are cross-field rules.
    return new AgentPersonaTemplate(props);
  }

  // Provide methods to access the VOs, adhering to "no direct getters"
  // by returning the VO itself, not its primitive value.
  public get id(): PersonaId {
    return this.props.id;
  }

  public get name(): PersonaName {
    return this.props.name;
  }

  public get role(): PersonaRole {
    return this.props.role;
  }

  public get goal(): PersonaGoal {
    return this.props.goal;
  }

  public get backstory(): PersonaBackstory | null {
    return this.props.backstory;
  }

  public get toolNames(): ToolNames {
    return this.props.toolNames;
  }

  // equals method is inherited from AbstractValueObject
}
