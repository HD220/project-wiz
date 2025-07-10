import { BaseEntity } from "@/main/kernel/domain/base.entity";
import { z } from "zod";

export const ForumPostPropsSchema = z.object({
  topicId: z.string().min(1, "Topic ID cannot be empty"),
  authorId: z.string().min(1, "Author ID cannot be empty"),
  content: z.string().min(1, "Content cannot be empty"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ForumPostProps = z.infer<typeof ForumPostPropsSchema>;

export class ForumPost extends BaseEntity<ForumPostProps> {
  constructor(props: ForumPostProps, id?: string) {
    ForumPostPropsSchema.parse(props);
    super(props, id);
  }

  public updateContent(newContent: string): void {
    this.props.content = newContent;
    this.props.updatedAt = new Date();
  }
}
