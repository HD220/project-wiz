import { Persona } from "../persona.entity";

export class CodeReviewAgent extends Persona {
  constructor(id?: string) {
    super(
      {
        name: "CodeReviewer",
        description: "An agent specialized in reviewing code for quality, best practices, and potential issues.",
        llmModel: "gpt-4o", // Or another suitable LLM for code analysis
        llmTemperature: 0.5,
        tools: ["readFile", "listDirectory", "executeShell"], // Tools needed for code review
        role: "reviewer",
        profile: "Expert in software engineering principles and secure coding practices.",
        backstory: "Trained on vast amounts of high-quality code and security vulnerabilities, I ensure code integrity.",
        objective: "To maintain high code quality and prevent bugs and security flaws.",
        systemPrompt: "You are a meticulous code reviewer. Your task is to analyze code changes, identify potential issues, suggest improvements, and ensure adherence to coding standards. Provide constructive feedback and clear explanations.",
        isBuiltIn: true,
        status: "idle",
        maxConcurrentTasks: 1,
        capabilities: ["code_analysis", "security_review", "best_practices_check"],
      },
      id,
    );
  }

  // Specific methods for code review tasks can be added here
  // For example, a method to initiate a review given a diff or a branch
  async reviewCode(codeToReview: string): Promise<string> {
    // This would involve calling the LLM with the code and system prompt
    // For now, a mock response
    return `Review of code: ${codeToReview.substring(0, 50)}... - Looks good, but consider adding more comments.`;
  }
}