export interface ConversationDto {
  id: string;
  type: "direct" | "group";
  participants: string[];
  lastMessageAt?: Date;
  createdAt: Date;
}
