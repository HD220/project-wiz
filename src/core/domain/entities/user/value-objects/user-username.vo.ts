import { z } from "zod";

const userUsernameSchema = z.string();
export class UserUsername {
  constructor(private readonly username: string) {
    userUsernameSchema.parse(username);
  }

  get value() {
    return this.username;
  }
}
