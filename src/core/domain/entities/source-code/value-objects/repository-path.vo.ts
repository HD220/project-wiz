import { z } from "zod";

const pathnameSchema = z.string().url();
export class RepositoryPath {
  constructor(private readonly pathname: string) {
    pathnameSchema.parse(pathname);
  }

  get value() {
    return this.pathname;
  }
}
