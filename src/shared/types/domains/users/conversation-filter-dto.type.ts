export interface ConversationFilterDto {
  type?: "direct" | "group";
  participantId?: string;
}
