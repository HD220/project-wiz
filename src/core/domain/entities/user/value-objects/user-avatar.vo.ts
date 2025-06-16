import { z } from "zod";

const userAvatarSchema = z.string().url();
export class UserAvatar {
  constructor(private readonly url: string) {
    userAvatarSchema.parse(url);
  }

  get value() {
    return this.url;
  }
}
