import { MessageService } from "./message.service";
import { ConversationService } from "./conversation.service";
import { PersonaService } from "../../persona-management/application/persona.service";
import { AIService } from "../../llm-provider/application/ai-service";
import type { CoreMessage } from "ai";
import type { MessageDto } from "../../../../shared/types/message.types";

export class AIMessageService {
  constructor(
    private messageService: MessageService,
    private conversationService: ConversationService,
    private personaService: PersonaService,
    private aiService: AIService,
  ) {}

  async processUserMessage(
    conversationId: string,
    userMessage: string,
    userId: string = "user",
  ): Promise<MessageDto | null> {
    try {
      console.log('[AIMessageService] Processing user message:', { conversationId, userMessage, userId });
      
      // 1. Save the user message first
      console.log('[AIMessageService] Saving user message...');
      const savedUserMessage = await this.messageService.createMessage({
        content: userMessage,
        senderId: userId,
        senderName: "User",
        senderType: "user",
        conversationId,
      });
      console.log('[AIMessageService] User message saved:', savedUserMessage.id);

      // 2. Get conversation details to identify the persona
      console.log('[AIMessageService] Getting conversation details...');
      const conversation =
        await this.conversationService.getConversationById(conversationId);
      if (!conversation) {
        console.error("[AIMessageService] Conversation not found:", conversationId);
        return null;
      }
      console.log('[AIMessageService] Conversation found, participants:', conversation.participants);

      // 3. Extract persona ID from conversation participants (assuming format: ['user', 'personaId'])
      const personaId = conversation.participants.find((p) => p !== userId);
      if (!personaId) {
        console.error("[AIMessageService] No persona found in conversation participants");
        return null;
      }
      console.log('[AIMessageService] Persona ID found:', personaId);

      // 4. Get persona details (try by ID first, then by name)
      console.log('[AIMessageService] Getting persona details...');
      let persona = await this.personaService.getPersonaById(personaId);
      
      // If not found by ID, try to find by name
      if (!persona) {
        console.log('[AIMessageService] Persona not found by ID, trying by name...', personaId);
        const personas = await this.personaService.listPersonas({ nome: personaId });
        console.log('[AIMessageService] Found personas by name:', personas.length, personas.map(p => ({ id: p.id, nome: p.nome })));
        persona = personas.length > 0 ? personas[0] : null;
      }
      
      if (!persona || !persona.isActive) {
        console.error("[AIMessageService] Persona not found or inactive:", personaId);
        return null;
      }
      
      console.log('[AIMessageService] Persona found:', { id: persona.id, nome: persona.nome, isActive: persona.isActive });

      // 5. Build conversation context for AI
      const conversationHistory =
        await this.buildConversationContext(conversationId);

      // 6. Generate AI response
      const aiResponse = await this.generatePersonaResponse(
        persona,
        conversationHistory,
        userMessage,
      );

      if (!aiResponse) {
        console.error("Failed to generate AI response");
        return null;
      }

      // 7. Save and return the AI message
      const aiMessage = await this.messageService.createMessage({
        content: aiResponse,
        senderId: personaId,
        senderName: persona.nome,
        senderType: "agent",
        conversationId,
      });

      return aiMessage;
    } catch (error) {
      console.error("Error processing user message:", error);
      return null;
    }
  }

  private async buildConversationContext(
    conversationId: string,
  ): Promise<CoreMessage[]> {
    try {
      // Get recent messages (last 20 for context)
      const messages = await this.messageService.getConversationMessages(
        conversationId,
        20,
        0,
      );

      // Convert to AI SDK format, reversing to get chronological order
      const coreMessages: CoreMessage[] = messages.reverse().map((msg) => ({
        role:
          msg.senderType === "user"
            ? ("user" as const)
            : ("assistant" as const),
        content: msg.content,
      }));

      return coreMessages;
    } catch (error) {
      console.error("Error building conversation context:", error);
      return [];
    }
  }

  private async generatePersonaResponse(
    persona: any,
    conversationHistory: CoreMessage[],
    currentMessage: string,
  ): Promise<string | null> {
    try {
      // Use persona's LLM provider if configured, otherwise use first available
      let providerId = persona.llmProviderId;

      if (!providerId) {
        const availableProviders = await this.aiService.getAvailableProviders();
        if (availableProviders.length === 0) {
          throw new Error("No LLM providers available");
        }
        providerId = availableProviders[0].id;
      }

      // Build messages array with system prompt and conversation history
      const messages: CoreMessage[] = [
        ...conversationHistory,
        {
          role: "user",
          content: currentMessage,
        },
      ];

      // Generate response using persona's system prompt
      const stream = await this.aiService.generateResponse(
        {
          providerId,
          systemPrompt: persona.getSystemPrompt(),
        },
        {
          messages,
          temperature: 0.7,
          maxTokens: 1000,
        },
      );

      // Return the stream directly for useChat
      return stream;

      return response;
    } catch (error) {
      console.error("Error generating persona response:", error);
      return null;
    }
  }

  // Method to regenerate a response (for UI retry functionality)
  async regenerateLastResponse(
    conversationId: string,
  ): Promise<MessageDto | null> {
    try {
      // Get the last two messages (user message and agent response)
      const recentMessages = await this.messageService.getConversationMessages(
        conversationId,
        2,
        0,
      );

      if (recentMessages.length < 2) {
        throw new Error("Not enough messages to regenerate");
      }

      const [lastMessage, previousMessage] = recentMessages;

      // Ensure we're regenerating an agent message after a user message
      if (
        lastMessage.senderType !== "agent" ||
        previousMessage.senderType !== "user"
      ) {
        throw new Error("Cannot regenerate: last message sequence is invalid");
      }

      // Delete the last agent message
      // Note: We would need to add a delete method to MessageService
      // For now, just generate a new response

      return await this.processUserMessage(
        conversationId,
        previousMessage.content,
        previousMessage.senderId,
      );
    } catch (error) {
      console.error("Error regenerating response:", error);
      return null;
    }
  }

  // Method to validate if a persona can process messages
  async validatePersonaForMessaging(personaId: string): Promise<boolean> {
    try {
      const persona = await this.personaService.getPersonaById(personaId);
      if (!persona || !persona.isActive) {
        return false;
      }

      // Check if there's an available LLM provider
      if (persona.llmProviderId) {
        return await this.aiService.validateProvider(persona.llmProviderId);
      } else {
        const providers = await this.aiService.getAvailableProviders();
        return providers.length > 0;
      }
    } catch (error) {
      console.error("Error validating persona for messaging:", error);
      return false;
    }
  }
}
