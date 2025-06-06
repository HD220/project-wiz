import { z } from "zod";

const personaNameSchema = z.string();
export class PersonaName {
  constructor(private readonly name: string) {
    personaNameSchema.parse(name);
  }
  get value() {
    return this.name;
  }
}
