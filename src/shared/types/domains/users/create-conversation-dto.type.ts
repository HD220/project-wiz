export interface CreateConversationDto {
  type?: "direct" | "group";
  participants: string[];
}
