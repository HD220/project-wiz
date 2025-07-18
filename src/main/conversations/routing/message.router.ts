import { z } from "zod";
import {
  enqueueJob,
  type CreateJobInput,
} from "../../agents/queue/queue.service";
import { findAgentsByProject } from "../../agents/worker/agent.service";
import { getLogger } from "../../utils/logger";

const logger = getLogger("message-router");

// Simple AI-like intent analysis patterns
const INTENT_PATTERNS = {
  code_implementation: [
    /create?\s+(.+?\s+)?(component|function|module|class|feature)/i,
    /implement\s+(.+)/i,
    /build\s+(.+)/i,
    /develop\s+(.+)/i,
    /write\s+(.+?\s+)?(code|function|component)/i,
    /add\s+(.+?\s+)?(component|function|feature)/i,
    /make\s+(.+)/i,
  ],
  code_review: [
    /review\s+(.+)/i,
    /check\s+(.+)/i,
    /look\s+at\s+(.+)/i,
    /examine\s+(.+)/i,
    /analyze\s+(.+)/i,
  ],
  bug_fix: [
    /fix\s+(.+)/i,
    /bug\s+(.+)/i,
    /error\s+(.+)/i,
    /issue\s+(.+)/i,
    /problem\s+(.+)/i,
    /broken\s+(.+)/i,
  ],
  testing: [
    /test\s+(.+)/i,
    /write\s+tests?\s+for\s+(.+)/i,
    /add\s+tests?\s+for\s+(.+)/i,
    /unit\s+test\s+(.+)/i,
    /integration\s+test\s+(.+)/i,
  ],
  documentation: [
    /document\s+(.+)/i,
    /write\s+docs?\s+for\s+(.+)/i,
    /add\s+documentation\s+for\s+(.+)/i,
    /readme\s+(.+)/i,
  ],
} as const;

// Agent mention patterns
const AGENT_MENTION_PATTERN = /@([\w-]+)/g;

// Message analysis result
type MessageAnalysis = {
  intent: keyof typeof INTENT_PATTERNS | null;
  confidence: number;
  description: string;
  mentionedAgents: string[];
  isTaskRequest: boolean;
  urgency: "low" | "medium" | "high";
};

// Route message input
const RouteMessageSchema = z.object({
  messageId: z.string(),
  content: z.string().min(1),
  authorId: z.string(),
  authorType: z.enum(["user", "agent"]),
  projectId: z.string(),
  channelId: z.string(),
});

export type RouteMessageInput = z.infer<typeof RouteMessageSchema>;

/**
 * Message Router - Analyzes messages and routes them to appropriate agents
 * KISS approach: Simple pattern matching and rule-based routing
 */
export class MessageRouter {
  /**
   * Route message to appropriate agent(s)
   */
  async routeMessage(input: RouteMessageInput): Promise<{
    taskCreated: boolean;
    jobId?: string;
    assignedAgent?: string;
    analysis: MessageAnalysis;
  }> {
    // 1. Validate input
    const validated = RouteMessageSchema.parse(input);

    // 2. Skip routing for agent messages
    if (validated.authorType === "agent") {
      logger.debug("Skipping routing for agent message");
      return {
        taskCreated: false,
        analysis: {
          intent: null,
          confidence: 0,
          description: validated.content,
          mentionedAgents: [],
          isTaskRequest: false,
          urgency: "low",
        },
      };
    }

    // 3. Analyze message
    const analysis = await this.analyzeMessage(validated.content);

    // 4. If not a task request, skip
    if (!analysis.isTaskRequest) {
      logger.debug("Message not identified as task request", { analysis });
      return {
        taskCreated: false,
        analysis,
      };
    }

    // 5. Find suitable agent
    const targetAgent = await this.findSuitableAgent(
      validated.projectId,
      analysis,
    );

    if (!targetAgent) {
      logger.warn("No suitable agent found for task", { analysis });
      return {
        taskCreated: false,
        analysis,
      };
    }

    // 6. Create job
    const jobInput: CreateJobInput = {
      type: analysis.intent || "code_implementation",
      description: analysis.description,
      projectId: validated.projectId,
      channelId: validated.channelId,
      assignedAgentId: targetAgent.id,
      priority: analysis.urgency,
      metadata: {
        originalMessageId: validated.messageId,
        originalContent: validated.content,
        authorId: validated.authorId,
        confidence: analysis.confidence,
      },
      createdBy: validated.authorId,
    };

    const job = await enqueueJob(jobInput);

    logger.info("Task created and routed to agent", {
      jobId: job.id,
      agentId: targetAgent.id,
      intent: analysis.intent,
      confidence: analysis.confidence,
    });

    return {
      taskCreated: true,
      jobId: job.id,
      assignedAgent: targetAgent.id,
      analysis,
    };
  }

  /**
   * Analyze message content to determine intent and task requirements
   */
  private async analyzeMessage(content: string): Promise<MessageAnalysis> {
    const cleanContent = content.trim().toLowerCase();

    // Check for agent mentions
    const mentionedAgents = this.extractAgentMentions(content);

    // Check for intent patterns
    let bestIntent: keyof typeof INTENT_PATTERNS | null = null;
    let bestConfidence = 0;
    let description = content;

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        const match = pattern.exec(content);
        if (match) {
          const confidence = this.calculateConfidence(match, cleanContent);
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestIntent = intent as keyof typeof INTENT_PATTERNS;
            description = match[1] || content;
          }
        }
      }
    }

    // Determine urgency
    const urgency = this.determineUrgency(cleanContent);

    // A message is a task request if:
    // 1. It has reasonable confidence in intent detection
    // 2. It mentions an agent
    // 3. It contains imperative language
    const isTaskRequest =
      bestConfidence > 0.6 ||
      mentionedAgents.length > 0 ||
      this.containsImperativeLanguage(cleanContent);

    return {
      intent: bestIntent,
      confidence: bestConfidence,
      description: description.trim(),
      mentionedAgents,
      isTaskRequest,
      urgency,
    };
  }

  /**
   * Extract agent mentions from message content
   */
  private extractAgentMentions(content: string): string[] {
    const mentions: string[] = [];
    let match;

    while ((match = AGENT_MENTION_PATTERN.exec(content)) !== null) {
      mentions.push(match[1]!);
    }

    return mentions;
  }

  /**
   * Calculate confidence score for intent match
   */
  private calculateConfidence(match: RegExpExecArray, content: string): number {
    let confidence = 0.7; // Base confidence

    // Boost confidence for direct matches
    if (match[0] === content) {
      confidence += 0.2;
    }

    // Boost confidence for longer matches
    if (match[0].length > 10) {
      confidence += 0.1;
    }

    // Boost confidence for specific terms
    const specificTerms = [
      "component",
      "function",
      "module",
      "feature",
      "bug",
      "test",
    ];
    for (const term of specificTerms) {
      if (content.includes(term)) {
        confidence += 0.05;
      }
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Determine urgency based on content
   */
  private determineUrgency(content: string): "low" | "medium" | "high" {
    const highUrgencyWords = [
      "urgent",
      "asap",
      "immediately",
      "critical",
      "emergency",
    ];
    const mediumUrgencyWords = ["soon", "quick", "fast", "important"];

    for (const word of highUrgencyWords) {
      if (content.includes(word)) {
        return "high";
      }
    }

    for (const word of mediumUrgencyWords) {
      if (content.includes(word)) {
        return "medium";
      }
    }

    return "low";
  }

  /**
   * Check if message contains imperative language
   */
  private containsImperativeLanguage(content: string): boolean {
    const imperativeWords = [
      "please",
      "can you",
      "could you",
      "would you",
      "help",
      "need",
      "want",
      "do",
      "create",
      "make",
      "build",
      "write",
      "add",
      "fix",
      "update",
      "delete",
      "remove",
      "change",
      "modify",
      "improve",
      "optimize",
    ];

    return imperativeWords.some((word) => content.includes(word));
  }

  /**
   * Find suitable agent for the task
   */
  private async findSuitableAgent(
    projectId: string,
    analysis: MessageAnalysis,
  ): Promise<{ id: string; name: string; expertise: string[] } | null> {
    try {
      // Get agents for project
      const projectAgents = await findAgentsByProject(projectId);

      if (projectAgents.length === 0) {
        logger.warn("No agents found for project", { projectId });
        return null;
      }

      // If specific agent mentioned, find it
      if (analysis.mentionedAgents.length > 0) {
        const mentionedAgent = projectAgents.find((agent) =>
          analysis.mentionedAgents.some((mention) =>
            agent.name.toLowerCase().includes(mention.toLowerCase()),
          ),
        );

        if (mentionedAgent) {
          return {
            id: mentionedAgent.id,
            name: mentionedAgent.name,
            expertise: mentionedAgent.expertise || [],
          };
        }
      }

      // Find agent by expertise match
      const expertiseKeywords = this.extractExpertiseKeywords(
        analysis.description,
      );
      let bestMatch: (typeof projectAgents)[0] | null = null;
      let bestScore = 0;

      for (const agent of projectAgents) {
        const agentExpertise = agent.expertise || [];
        const score = this.calculateExpertiseMatch(
          expertiseKeywords,
          agentExpertise,
        );

        if (score > bestScore) {
          bestScore = score;
          bestMatch = agent;
        }
      }

      // If no good match, pick first available agent
      if (bestScore === 0 && projectAgents.length > 0) {
        bestMatch = projectAgents[0];
      }

      return bestMatch
        ? {
            id: bestMatch.id,
            name: bestMatch.name,
            expertise: bestMatch.expertise || [],
          }
        : null;
    } catch (error) {
      logger.error("Error finding suitable agent", { error });
      return null;
    }
  }

  /**
   * Extract expertise keywords from description
   */
  private extractExpertiseKeywords(description: string): string[] {
    const keywords: string[] = [];
    const techKeywords = [
      "react",
      "vue",
      "angular",
      "javascript",
      "typescript",
      "node",
      "python",
      "java",
      "css",
      "html",
      "backend",
      "frontend",
      "api",
      "database",
      "sql",
      "mongodb",
      "postgres",
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "gcp",
      "testing",
      "jest",
      "cypress",
      "selenium",
      "ui",
      "ux",
      "design",
    ];

    const lowerDescription = description.toLowerCase();

    for (const keyword of techKeywords) {
      if (lowerDescription.includes(keyword)) {
        keywords.push(keyword);
      }
    }

    return keywords;
  }

  /**
   * Calculate expertise match score
   */
  private calculateExpertiseMatch(
    keywords: string[],
    expertise: string[],
  ): number {
    if (keywords.length === 0 || expertise.length === 0) {
      return 0;
    }

    const lowerExpertise = expertise.map((e) => e.toLowerCase());
    let matches = 0;

    for (const keyword of keywords) {
      if (lowerExpertise.includes(keyword)) {
        matches++;
      }
    }

    return matches / keywords.length;
  }
}

// Export singleton instance
export const messageRouter = new MessageRouter();

// Export helper function
export async function routeMessage(input: RouteMessageInput): Promise<{
  taskCreated: boolean;
  jobId?: string;
  assignedAgent?: string;
  analysis: MessageAnalysis;
}> {
  return messageRouter.routeMessage(input);
}
