import { z } from "zod";

const projectNameSchema = z.string();
export class ProjectName {
  constructor(private readonly name: string) {
    projectNameSchema.parse(name);
  }
  get value() {
    return this.name;
  }
}
