import { z } from "zod";

const projectDescriptionSchema = z.string();
export class ProjectDescription {
  constructor(private readonly description: string = "") {
    projectDescriptionSchema.parse(description);
  }
  get value() {
    return this.description;
  }
}
