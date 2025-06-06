import { z } from "zod";

const personaBackstorySchema = z.string();
export class PersonaBackstory {
  constructor(private readonly backstory: string) {
    personaBackstorySchema.parse(backstory);
  }
  get value() {
    return this.backstory;
  }
}
