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

  get topicId(): string {
    return this.props.topicId;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get content(): string {
    return this.props.content;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateContent(newContent: string): void {
    this.props.content = newContent;
    this.props.updatedAt = new Date();
  }
}
