import { z } from "zod";

const urlSchema = z.string().url();
export class RepositoryUrl {
  constructor(private readonly url: string) {
    urlSchema.parse(url);
  }
  get value() {
    return this.url;
  }
}
