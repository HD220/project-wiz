import { and, eq, desc, asc } from "drizzle-orm";
import { db } from "../../database";
import { llmJobsTable, type SelectLLMJob } from "./llm-jobs.model";
import type { 
  ProcessMessageJobData, 
  AnalyzeCodeJobData, 
  GenerateCodeJobData,
  LLMResponse,
  JobExecutionResult,
  ProcessorConfig 
} from "./llm-jobs.types";
import { 
  LLMClientFactory,
  OpenAIClient,
  AnthropicClient,
  type OpenAIMessage,
  type AnthropicMessage 
} from "./llm-clients";

export class JobProcessor {
  private running = false;
  private config: ProcessorConfig = {
    pollInterval: 100, // 100ms for responsive processing
    maxConcurrentJobs: 1, // Sequential processing
    retryDelay: 1000, // 1 second retry delay
  };

  async start(): Promise<void> {
    this.running = true;
    console.log("🔄 Job processor started with config:", this.config);

    while (this.running) {
      try {
        const job = await this.getNextJob();
        if (job) {
          // Process job sequentially - one at a time
          await this.processJob(job);
        } else {
          // No jobs found - wait before next poll
          await this.delay(this.config.pollInterval);
        }
      } catch (error) {
        console.error("💥 Job processing error:", error);
        await this.delay(this.config.pollInterval);
      }
    }
  }

  async stop(): Promise<void> {
    console.log("🛑 Stopping job processor...");
    this.running = false;
  }

  private async getNextJob(): Promise<SelectLLMJob | null> {
    const now = Date.now();
    
    // Get waiting jobs or delayed jobs that are ready to be processed
    const job = await db
      .select()
      .from(llmJobsTable)
      .where(
        and(
          eq(llmJobsTable.dependencyCount, 0),
          // Include waiting jobs or delayed jobs where processedOn time has passed
        ),
      )
      .orderBy(desc(llmJobsTable.priority), asc(llmJobsTable.createdAt))
      .limit(1)
      .get();

    // Filter jobs by status and delay
    if (!job) return null;

    if (job.status === "waiting") {
      return job;
    }

    if (job.status === "delayed") {
      // Check if delay time has passed
      const isReady = job.processedOn && job.processedOn.getTime() <= now;
      if (isReady) {
        // Update job to waiting status before processing
        await db
          .update(llmJobsTable)
          .set({
            status: "waiting",
            delay: 0,
          })
          .where(eq(llmJobsTable.id, job.id));
        
        return { ...job, status: "waiting" as const };
      }
    }

    return null;
  }

  private async processJob(job: SelectLLMJob): Promise<void> {
    const startTime = Date.now();
    console.log(`🔄 Processing job ${job.id} (${job.name})`);

    try {
      // Mark job as active
      await this.markJobActive(job.id);

      // Execute the job based on its type
      const result = await this.executeJob(job);

      // Mark job as completed
      await this.markJobCompleted(job.id, result, Date.now() - startTime);

      console.log(`✅ Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      await this.markJobFailed(job.id, error as Error, Date.now() - startTime);
    }
  }

  private async executeJob(job: SelectLLMJob): Promise<JobExecutionResult> {
    const jobData = JSON.parse(job.data);

    switch (job.name) {
      case "process_message":
        return await this.processMessage(jobData as ProcessMessageJobData);
      case "analyze_code":
        return await this.analyzeCode(jobData as AnalyzeCodeJobData);
      case "generate_code":
        return await this.generateCode(jobData as GenerateCodeJobData);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async processMessage(data: ProcessMessageJobData): Promise<JobExecutionResult> {
    try {
      console.log(`🤖 Processing message for user ${data.userId} with provider ${data.llmProvider.name}`);
      
      // Extract API key from provider config
      const apiKey = data.llmProvider.config?.apiKey;
      if (!apiKey) {
        throw new Error(`No API key found for provider ${data.llmProvider.name}`);
      }

      // Create LLM client based on provider
      const client = LLMClientFactory.createClient(
        data.llmProvider.name,
        apiKey,
        data.llmProvider.config?.baseUrl
      );

      let response: LLMResponse;

      if (client instanceof OpenAIClient) {
        // Prepare messages for OpenAI format
        const messages: OpenAIMessage[] = [];
        
        // Add conversation history if available
        if (data.conversationHistory) {
          for (const msg of data.conversationHistory) {
            messages.push({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            });
          }
        }
        
        // Add current message
        messages.push({
          role: "user",
          content: data.message,
        });

        const openaiResponse = await client.createChatCompletion({
          model: data.llmProvider.config?.model || "gpt-3.5-turbo",
          messages,
          temperature: data.llmProvider.config?.temperature || 0.7,
          max_tokens: data.llmProvider.config?.maxTokens || 1000,
        });

        response = {
          content: openaiResponse.choices[0]?.message?.content || "",
          usage: {
            prompt_tokens: openaiResponse.usage.prompt_tokens,
            completion_tokens: openaiResponse.usage.completion_tokens,
            total_tokens: openaiResponse.usage.total_tokens,
          },
          model: openaiResponse.model,
          provider: data.llmProvider.name,
        };
      } else if (client instanceof AnthropicClient) {
        // Prepare messages for Anthropic format
        const messages: AnthropicMessage[] = [];
        
        // Add conversation history if available
        if (data.conversationHistory) {
          for (const msg of data.conversationHistory) {
            if (msg.role !== "system") { // Anthropic doesn't use system messages in messages array
              messages.push({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content,
              });
            }
          }
        }
        
        // Add current message
        messages.push({
          role: "user",
          content: data.message,
        });

        const anthropicResponse = await client.createMessage({
          model: data.llmProvider.config?.model || "claude-3-haiku-20240307",
          max_tokens: data.llmProvider.config?.maxTokens || 1000,
          messages,
          temperature: data.llmProvider.config?.temperature || 0.7,
        });

        response = {
          content: anthropicResponse.content[0]?.text || "",
          usage: {
            prompt_tokens: anthropicResponse.usage.input_tokens,
            completion_tokens: anthropicResponse.usage.output_tokens,
            total_tokens: anthropicResponse.usage.input_tokens + anthropicResponse.usage.output_tokens,
          },
          model: anthropicResponse.model,
          provider: data.llmProvider.name,
        };
      } else {
        throw new Error(`Unsupported client type for provider ${data.llmProvider.name}`);
      }

      console.log(`✅ Successfully processed message for user ${data.userId} (${response.usage?.total_tokens} tokens)`);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error(`❌ Failed to process message for user ${data.userId}:`, error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async analyzeCode(data: AnalyzeCodeJobData): Promise<JobExecutionResult> {
    try {
      console.log(`🔍 Analyzing code for project ${data.projectId} (${data.analysisType})`);
      
      // For code analysis, we'll use a default provider (this could be configurable)
      // For now, we'll keep this as a mock but structure it for future HTTP client usage
      // const _analysisPrompt = this.buildCodeAnalysisPrompt(data);
      
      console.log(`📝 Analysis prompt prepared for ${data.analysisType} analysis`);
      
      // TODO: In the future, this would use an LLM client for actual code analysis
      // For now, we'll return a structured mock response
      const analysis = {
        type: data.analysisType,
        file: data.filePath,
        issues: this.generateMockIssues(data.analysisType),
        suggestions: this.generateMockSuggestions(data.analysisType),
        summary: `${data.analysisType} analysis completed for ${data.filePath}`,
      };

      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      console.error(`❌ Failed to analyze code for project ${data.projectId}:`, error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // TODO: Will be used in future for actual LLM code analysis
  // private buildCodeAnalysisPrompt(data: AnalyzeCodeJobData): string {
  //   const prompts = {
  //     security: `Analyze the following code for security vulnerabilities:\n\n${data.code}\n\nFocus on: SQL injection, XSS, authentication issues, and data validation.`,
  //     performance: `Analyze the following code for performance issues:\n\n${data.code}\n\nFocus on: algorithmic complexity, memory usage, and optimization opportunities.`,
  //     style: `Analyze the following code for style and maintainability:\n\n${data.code}\n\nFocus on: code organization, naming conventions, and best practices.`,
  //     general: `Perform a general code review of the following code:\n\n${data.code}\n\nProvide overall feedback and improvement suggestions.`,
  //   };
  //   
  //   return prompts[data.analysisType] || prompts.general;
  // }

  private generateMockIssues(analysisType: string): any[] {
    const issuesMap: Record<string, any[]> = {
      security: [
        { severity: "medium", line: 45, message: "Potential SQL injection vulnerability" },
        { severity: "low", line: 23, message: "Input validation should be strengthened" },
      ],
      performance: [
        { severity: "high", line: 67, message: "O(n²) algorithm could be optimized" },
        { severity: "medium", line: 12, message: "Consider caching this computation" },
      ],
      style: [
        { severity: "low", line: 34, message: "Variable name could be more descriptive" },
        { severity: "low", line: 89, message: "Function is too long, consider breaking it down" },
      ],
      general: [
        { severity: "medium", line: 56, message: "Error handling could be improved" },
        { severity: "low", line: 78, message: "Consider adding documentation" },
      ],
    };
    
    const issues = issuesMap[analysisType];
    return issues || issuesMap["general"]!;
  }

  private generateMockSuggestions(analysisType: string): string[] {
    const suggestionsMap: Record<string, string[]> = {
      security: [
        "Use parameterized queries to prevent SQL injection",
        "Implement proper input validation and sanitization",
        "Add rate limiting to prevent abuse",
      ],
      performance: [
        "Consider using a more efficient algorithm",
        "Implement caching for frequently accessed data",
        "Optimize database queries",
      ],
      style: [
        "Follow consistent naming conventions",
        "Break down large functions into smaller ones",
        "Add proper documentation and comments",
      ],
      general: [
        "Improve error handling and logging",
        "Add unit tests for better coverage",
        "Consider refactoring for better maintainability",
      ],
    };
    
    const suggestions = suggestionsMap[analysisType];
    return suggestions || suggestionsMap["general"]!;
  }

  private async generateCode(data: GenerateCodeJobData): Promise<JobExecutionResult> {
    try {
      console.log(`🛠️ Generating ${data.codeType} for project ${data.projectId}`);
      
      // Build generation prompt for future LLM usage
      // const _generationPrompt = this.buildCodeGenerationPrompt(data);
      
      console.log(`📝 Generation prompt prepared for ${data.codeType}`);
      
      // TODO: In the future, this would use an LLM client for actual code generation
      // For now, we'll return a structured mock response with realistic code templates
      const generatedCode = {
        type: data.codeType,
        language: data.language,
        framework: data.framework,
        code: this.generateMockCode(data),
        description: `Generated ${data.codeType} based on requirements`,
        requirements: data.requirements,
      };

      return {
        success: true,
        data: generatedCode,
      };
    } catch (error) {
      console.error(`❌ Failed to generate code for project ${data.projectId}:`, error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // TODO: Will be used in future for actual LLM code generation
  // private buildCodeGenerationPrompt(data: GenerateCodeJobData): string {
  //   const basePrompt = `Generate a ${data.codeType} in ${data.language}`;
  //   const frameworkPart = data.framework ? ` using ${data.framework}` : "";
  //   const requirementsPart = `\n\nRequirements:\n${data.requirements}`;
  //   
  //   return `${basePrompt}${frameworkPart}${requirementsPart}\n\nPlease provide clean, well-documented code that follows best practices.`;
  // }

  private generateMockCode(data: GenerateCodeJobData): string {
    const templates = {
      component: this.generateComponentTemplate(data),
      service: this.generateServiceTemplate(data),
      util: this.generateUtilTemplate(data),
      test: this.generateTestTemplate(data),
    };
    
    return templates[data.codeType] || templates.util;
  }

  private generateComponentTemplate(data: GenerateCodeJobData): string {
    if (data.language.toLowerCase().includes("typescript") || data.language.toLowerCase().includes("react")) {
      return `// Generated React Component
import { useState } from "react";

interface Props {
  // Define props based on requirements
}

export function GeneratedComponent({ }: Props) {
  const [state, setState] = useState("");

  return (
    <div className="generated-component">
      <h2>Generated Component</h2>
      <p>Requirements: ${data.requirements}</p>
      {/* TODO: Implement component logic */}
    </div>
  );
}

export default GeneratedComponent;`;
    }
    
    return `<!-- Generated Component -->
<div class="generated-component">
  <h2>Generated Component</h2>
  <p>Requirements: ${data.requirements}</p>
  <!-- TODO: Implement component logic -->
</div>`;
  }

  private generateServiceTemplate(data: GenerateCodeJobData): string {
    if (data.language.toLowerCase().includes("typescript")) {
      return `// Generated Service
export class GeneratedService {
  private config: any;

  constructor(config: any = {}) {
    this.config = config;
  }

  /**
   * Main service method
   * Requirements: ${data.requirements}
   */
  async execute(input: any): Promise<any> {
    try {
      // TODO: Implement service logic based on requirements
      console.log("Executing service with input:", input);
      
      return {
        success: true,
        data: null,
      };
    } catch (error) {
      console.error("Service execution failed:", error);
      throw error;
    }
  }

  /**
   * Helper method for validation
   */
  private validate(input: any): boolean {
    // TODO: Add validation logic
    return true;
  }
}

export default GeneratedService;`;
    }
    
    return `// Generated Service
class GeneratedService {
  constructor(config = {}) {
    this.config = config;
  }

  async execute(input) {
    try {
      // TODO: Implement service logic based on requirements: ${data.requirements}
      console.log("Executing service with input:", input);
      
      return {
        success: true,
        data: null,
      };
    } catch (error) {
      console.error("Service execution failed:", error);
      throw error;
    }
  }
}

module.exports = GeneratedService;`;
  }

  private generateUtilTemplate(data: GenerateCodeJobData): string {
    if (data.language.toLowerCase().includes("typescript")) {
      return `// Generated Utility Functions
/**
 * Generated utility based on requirements: ${data.requirements}
 */

export function generatedUtility(input: any): any {
  // TODO: Implement utility logic
  console.log("Generated utility called with:", input);
  return input;
}

export function validateInput(input: any): boolean {
  // TODO: Add validation logic
  return typeof input !== "undefined";
}

export function formatOutput(data: any): string {
  // TODO: Add formatting logic
  return JSON.stringify(data, null, 2);
}

export default {
  generatedUtility,
  validateInput,
  formatOutput,
};`;
    }
    
    return `// Generated Utility Functions
/**
 * Generated utility based on requirements: ${data.requirements}
 */

function generatedUtility(input) {
  // TODO: Implement utility logic
  console.log("Generated utility called with:", input);
  return input;
}

function validateInput(input) {
  // TODO: Add validation logic
  return typeof input !== "undefined";
}

function formatOutput(data) {
  // TODO: Add formatting logic
  return JSON.stringify(data, null, 2);
}

module.exports = {
  generatedUtility,
  validateInput,
  formatOutput,
};`;
  }

  private generateTestTemplate(data: GenerateCodeJobData): string {
    if (data.language.toLowerCase().includes("typescript") || data.framework?.toLowerCase().includes("vitest")) {
      return `// Generated Test Suite
import { describe, it, expect, beforeEach } from "vitest";

// TODO: Import the component/service being tested
// import { ComponentToTest } from "./component-to-test";

describe("Generated Test Suite", () => {
  beforeEach(() => {
    // TODO: Setup test environment
  });

  it("should meet basic requirements", () => {
    // TODO: Test basic functionality
    // Requirements: ${data.requirements}
    expect(true).toBe(true);
  });

  it("should handle edge cases", () => {
    // TODO: Test edge cases
    expect(true).toBe(true);
  });

  it("should validate input correctly", () => {
    // TODO: Test input validation
    expect(true).toBe(true);
  });
});`;
    }
    
    return `// Generated Test Suite
const assert = require("assert");

// TODO: Import the component/service being tested
// const ComponentToTest = require("./component-to-test");

describe("Generated Test Suite", () => {
  beforeEach(() => {
    // TODO: Setup test environment
  });

  it("should meet basic requirements", () => {
    // TODO: Test basic functionality
    // Requirements: ${data.requirements}
    assert.strictEqual(true, true);
  });

  it("should handle edge cases", () => {
    // TODO: Test edge cases
    assert.strictEqual(true, true);
  });

  it("should validate input correctly", () => {
    // TODO: Test input validation
    assert.strictEqual(true, true);
  });
});`;
  }

  private async markJobActive(jobId: string): Promise<void> {
    await db
      .update(llmJobsTable)
      .set({
        status: "active",
        processedOn: new Date(Date.now()),
      })
      .where(eq(llmJobsTable.id, jobId));
  }

  private async markJobCompleted(jobId: string, result: JobExecutionResult, _duration: number): Promise<void> {
    await db
      .update(llmJobsTable)
      .set({
        status: "completed",
        result: JSON.stringify(result),
        finishedOn: new Date(Date.now()),
        progress: 100,
      })
      .where(eq(llmJobsTable.id, jobId));

    // Update dependent jobs (decrease dependency count)
    await this.updateDependentJobs(jobId);
  }

  private async markJobFailed(jobId: string, error: Error, _duration: number): Promise<void> {
    // First, get the current job to check retry attempts
    const job = await db
      .select()
      .from(llmJobsTable)
      .where(eq(llmJobsTable.id, jobId))
      .get();

    if (!job) {
      console.error(`Job ${jobId} not found when marking as failed`);
      return;
    }

    const newAttempts = job.attempts + 1;
    const shouldRetry = newAttempts < job.maxAttempts;

    if (shouldRetry) {
      console.log(`🔄 Retrying job ${jobId} (attempt ${newAttempts}/${job.maxAttempts})`);
      
      // Mark as waiting for retry with backoff delay
      const retryDelay = this.calculateRetryDelay(newAttempts);
      await db
        .update(llmJobsTable)
        .set({
          status: "delayed",
          attempts: newAttempts,
          delay: retryDelay,
          failureReason: error.message, // Keep last error for debugging
          processedOn: new Date(Date.now() + retryDelay), // Set when job should become available
        })
        .where(eq(llmJobsTable.id, jobId));

      console.log(`⏰ Job ${jobId} will retry in ${retryDelay}ms`);
    } else {
      console.log(`❌ Job ${jobId} exhausted all retry attempts (${newAttempts}/${job.maxAttempts})`);
      
      // Mark as permanently failed
      await db
        .update(llmJobsTable)
        .set({
          status: "failed",
          attempts: newAttempts,
          failureReason: error.message,
          stacktrace: error.stack,
          finishedOn: new Date(Date.now()),
        })
        .where(eq(llmJobsTable.id, jobId));
    }
  }

  private async updateDependentJobs(completedJobId: string): Promise<void> {
    // Find all jobs that depend on this completed job
    const dependentJobs = await db
      .select()
      .from(llmJobsTable)
      .where(eq(llmJobsTable.parentJobId, completedJobId));

    // Decrease dependency count for each dependent job
    for (const job of dependentJobs) {
      const newDependencyCount = Math.max(0, job.dependencyCount - 1);
      
      await db
        .update(llmJobsTable)
        .set({
          dependencyCount: newDependencyCount,
        })
        .where(eq(llmJobsTable.id, job.id));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay for retries
   * Uses exponential backoff: base * (2 ^ attempts) with jitter
   */
  private calculateRetryDelay(attempts: number): number {
    const baseDelay = 1000; // 1 second base delay
    const maxDelay = 30000; // 30 seconds max delay
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (capped)
    const exponentialDelay = baseDelay * Math.pow(2, attempts - 1);
    
    // Add jitter (±25%) to prevent thundering herd
    const jitter = 0.25;
    const jitterFactor = 1 + (Math.random() - 0.5) * jitter;
    
    const finalDelay = Math.min(exponentialDelay * jitterFactor, maxDelay);
    
    return Math.floor(finalDelay);
  }
}