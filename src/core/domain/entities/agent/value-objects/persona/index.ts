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

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
// Consumers of the removed individual getters should be updated to use `persona.getProps().fieldName.getValue()`
// or ideally, new behavioral methods on Persona or its VOs.
export class Persona {
  private constructor(private readonly fields: PersonaConstructor) {
    // VOs themselves are already validated.
    // This constructor assumes valid VOs are passed.
  }

  public static create(props: PersonaConstructor): Persona {
    if (!props.id || !props.name || !props.role || !props.goal || !props.backstory) {
      // Consider using DomainError from '@/core/common/errors'
      throw new Error("Persona ID, Name, Role, Goal, and Backstory are mandatory to create a Persona.");
    }
    return new Persona(props);
  }

  public getProps(): Readonly<PersonaConstructor> {
    return { ...this.fields };
  }

  // Individual getters removed
  // get id() {
  //   return this.fields.id;
  // }

  // get name() {
  //   return this.fields.name;
  // }

  // get role() {
  //   return this.fields.role;
  // }

  // get goal() {
  //   return this.fields.goal;
  // }

  // get backstory() {
  //   return this.fields.backstory;
  // }

  public equals(other: Persona): boolean {
    if (this === other) return true;
    if (!other) return false;
    return (
      this.fields.id.equals(other.fields.id) &&
      this.fields.name.equals(other.fields.name) &&
      this.fields.role.equals(other.fields.role) &&
      this.fields.goal.equals(other.fields.goal) &&
      this.fields.backstory.equals(other.fields.backstory)
    );
  }
}
