import {
  PersonaBackstory,
  PersonaGoal,
  PersonaId,
  PersonaName,
  PersonaPersonality,
  PersonaRole,
  PersonaGender,
} from "./value-objects";

export type PersonaConstructor = {
  id: PersonaId;
  name: PersonaName;
  gender: PersonaGender;
  role: PersonaRole;
  goal: PersonaGoal;
  backstory: PersonaBackstory;
  personality: PersonaPersonality;
};
export class Persona {
  constructor(private readonly fields: PersonaConstructor) {}

  get id() {
    return this.fields.id;
  }

  get name() {
    return this.fields.name;
  }

  get gender() {
    return this.fields.gender;
  }

  get role() {
    return this.fields.role;
  }

  get goal() {
    return this.fields.goal;
  }

  get backstory() {
    return this.fields.backstory;
  }

  get personality() {
    return this.fields.personality;
  }
}
