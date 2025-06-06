import { z } from "zod";

const personaRoleSchema = z.string();
export class PersonaRole {
  constructor(private readonly role: string) {
    personaRoleSchema.parse(role);
  }
  get value() {
    return this.role;
  }
}
