import { z } from "zod";

const branchSchema = z.string();
export class Branch {
  constructor(private readonly name: string) {
    branchSchema.parse(name);
  }

  get value() {
    return this.name;
  }
}
