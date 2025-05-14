import { z } from "zod";

const userEmailSchema = z.string().email();
export class UserEmail {
  constructor(private readonly email: string) {
    userEmailSchema.parse(email);
  }

  get value() {
    return this.email;
  }
}
