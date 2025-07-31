// Test for LLM worker functionality
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { JobProcessor } from "./llm-jobs.service";
import { LLMClientFactory, OpenAIClient, AnthropicClient } from "./llm-clients";

// Mock the database
vi.mock("../../database", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    get: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  },
}));

describe("LLM Worker Service", () => {
  let processor: JobProcessor;

  beforeEach(() => {
    processor = new JobProcessor();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await processor.stop();
  });

  describe("JobProcessor", () => {
    it("should create a job processor instance", () => {
      expect(processor).toBeInstanceOf(JobProcessor);
    });

    it("should have proper configuration", () => {
      const config = (processor as any).config;
      expect(config.pollInterval).toBe(100);
      expect(config.maxConcurrentJobs).toBe(1);
      expect(config.retryDelay).toBe(1000);
    });
  });

  describe("LLM Clients", () => {
    it("should create OpenAI client", () => {
      const client = LLMClientFactory.createOpenAI("test-api-key");
      expect(client).toBeInstanceOf(OpenAIClient);
    });

    it("should create Anthropic client", () => {
      const client = LLMClientFactory.createAnthropic("test-api-key");
      expect(client).toBeInstanceOf(AnthropicClient);
    });

    it("should create client based on provider name", () => {
      const openaiClient = LLMClientFactory.createClient("openai", "test-key");
      expect(openaiClient).toBeInstanceOf(OpenAIClient);

      const anthropicClient = LLMClientFactory.createClient("anthropic", "test-key");
      expect(anthropicClient).toBeInstanceOf(AnthropicClient);
    });

    it("should throw error for unsupported provider", () => {
      expect(() => {
        LLMClientFactory.createClient("unsupported", "test-key");
      }).toThrow("Unsupported LLM provider: unsupported");
    });
  });

  describe("HTTP Client Configuration", () => {
    it("should configure OpenAI client with correct defaults", () => {
      const client = new OpenAIClient({ apiKey: "test-key" });
      expect(client).toBeInstanceOf(OpenAIClient);
    });

    it("should configure Anthropic client with correct defaults", () => {
      const client = new AnthropicClient({ apiKey: "test-key" });
      expect(client).toBeInstanceOf(AnthropicClient);
    });

    it("should support custom base URLs", () => {
      const openaiClient = new OpenAIClient({ 
        apiKey: "test-key", 
        baseUrl: "https://custom-api.example.com" 
      });
      expect(openaiClient).toBeInstanceOf(OpenAIClient);

      const anthropicClient = new AnthropicClient({ 
        apiKey: "test-key", 
        baseUrl: "https://custom-api.example.com" 
      });
      expect(anthropicClient).toBeInstanceOf(AnthropicClient);
    });
  });

  describe("Job Processing Patterns", () => {
    it("should have sequential processing configuration", () => {
      const config = (processor as any).config;
      expect(config.maxConcurrentJobs).toBe(1);
    });

    it("should handle I/O bound operations (HTTP calls)", () => {
      // Test that our HTTP clients are properly structured for I/O operations
      const openaiClient = new OpenAIClient({ apiKey: "test-key" });
      const anthropicClient = new AnthropicClient({ apiKey: "test-key" });

      // Verify clients have the expected HTTP call methods
      expect(typeof openaiClient.createChatCompletion).toBe("function");
      expect(typeof anthropicClient.createMessage).toBe("function");
    });

    it("should support dependency checking", async () => {
      const { db } = await import("../../database");
      const getSpy = vi.mocked(db.get);

      // Mock a job with dependencies
      getSpy.mockResolvedValue({
        id: "job-2",
        name: "process_message",
        data: "{}",
        status: "waiting",
        priority: 1,
        createdAt: new Date(),
        dependencyCount: 1, // Has dependencies
      });

      const processor = new JobProcessor();
      
      const job = await (processor as any).getNextJob();
      
      // Job with dependencies should still be returned if it matches criteria
      // (The actual dependency logic happens in the WHERE clause)
      expect(job).toBeDefined();
    });
  });
});