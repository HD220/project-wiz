import { z } from "zod";

const personaPersonalitySchema = z.string();
export class PersonaPersonality {
  constructor(private readonly personality: string) {
    personaPersonalitySchema.parse(personality);
  }
  get value() {
    return this.personality;
  }
}
