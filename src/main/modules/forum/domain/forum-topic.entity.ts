import { BaseEntity } from "@/main/kernel/domain/base.entity";
import { z } from "zod";

export const ForumTopicPropsSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  authorId: z.string().min(1, "Author ID cannot be empty"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ForumTopicProps = z.infer<typeof ForumTopicPropsSchema>;

export class ForumTopic extends BaseEntity<ForumTopicProps> {
  constructor(props: ForumTopicProps, id?: string) {
    ForumTopicPropsSchema.parse(props);
    super(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateTitle(newTitle: string): void {
    this.props.title = newTitle;
    this.props.updatedAt = new Date();
  }
}
