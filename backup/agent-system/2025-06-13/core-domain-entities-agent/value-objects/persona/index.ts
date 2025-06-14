import {
  PersonaBackstory,
  PersonaGoal,
  PersonaId,
  PersonaName,
  PersonaRole,
} from "./value-objects";

export type PersonaConstructor = {
  id: PersonaId;
  name: PersonaName;
  role: PersonaRole;
  goal: PersonaGoal;
  backstory: PersonaBackstory;
};
export class Persona {
  constructor(private readonly fields: PersonaConstructor) {}

  get name() {
    return this.fields.name;
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
}
