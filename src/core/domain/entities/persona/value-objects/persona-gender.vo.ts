import { z } from "zod";

const personaGenderSchema = z.union([z.literal("male"), z.literal("female")]);
export class PersonaGender {
  constructor(private readonly gender: z.infer<typeof personaGenderSchema>) {
    personaGenderSchema.parse(gender);
  }
  get value() {
    return this.gender;
  }
}
