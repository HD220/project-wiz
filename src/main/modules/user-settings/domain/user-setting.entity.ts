import { BaseEntity } from "@/main/kernel/domain/base.entity";
import { z } from "zod";

export const UserSettingPropsSchema = z.object({
  userId: z.string().min(1, "User ID cannot be empty"),
  key: z.string().min(1, "Setting key cannot be empty"),
  value: z.string().min(1, "Setting value cannot be empty"),
});

export type UserSettingProps = z.infer<typeof UserSettingPropsSchema>;

export class UserSetting extends BaseEntity<UserSettingProps> {
  constructor(props: UserSettingProps, id?: string) {
    UserSettingPropsSchema.parse(props);
    super(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get key(): string {
    return this.props.key;
  }

  get value(): string {
    return this.props.value;
  }

  public updateValue(newValue: string): void {
    this.props.value = newValue;
  }
}
