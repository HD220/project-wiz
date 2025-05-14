import { z } from "zod";

const userNicknameSchema = z.string();
export class UserNickname {
  constructor(private readonly nickname: string) {
    userNicknameSchema.parse(nickname);
  }

  get value() {
    return this.nickname;
  }
}
