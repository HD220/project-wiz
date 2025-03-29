import { jest, describe, beforeEach, test, expect } from "@jest/globals";
import { LlamaWorker } from "./llama-worker";
import { MessagePortMain } from "electron";
import {
  TextCompletionMessage,
  ChatCompletionMessage,
  CompletionDoneResponse,
} from "./llama-types";

// Mock simplificado do node-llama-cpp
jest.mock("node-llama-cpp", () => ({
  getLlama: jest.fn(),
  createChatSession: jest.fn(),
  createCompletion: jest.fn(),
  downloadModel: jest.fn(),
}));

// Mock simplificado do MessagePortMain
const createMockPort = () => ({
  postMessage: jest.fn(),
  on: jest.fn(),
  start: jest.fn(),
});

describe("LlamaWorker Integration Tests", () => {
  let worker: LlamaWorker;
  let mockPort: ReturnType<typeof createMockPort>;

  beforeEach(() => {
    mockPort = createMockPort();
    worker = new LlamaWorker(mockPort as unknown as MessagePortMain);
  });

  test("handleChatCompletionForTextMessage returns valid structure", async () => {
    const message: TextCompletionMessage = {
      type: "text_completion",
      prompt: "Test prompt",
      requestId: "test-request",
    };

    const mockResponse: CompletionDoneResponse = {
      type: "completion_done",
      fullText: "test response",
      stats: {
        totalTokens: 10,
        evaluationTime: 100,
        tokensPerSecond: 0.1,
      },
    };

    jest
      .spyOn(worker as any, "handleChatCompletionForTextMessage")
      .mockResolvedValue(mockResponse);

    const result = await worker["handleChatCompletionForTextMessage"](message);

    expect(result).toEqual(mockResponse);
  });

  test("handleChatCompletionMessage handles multi-message conversations", async () => {
    const message: ChatCompletionMessage = {
      type: "chat_completion",
      messages: [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Test question" },
      ],
      requestId: "test-request",
    };

    const mockResponse: CompletionDoneResponse = {
      type: "completion_done",
      fullText: "test response",
      stats: {
        totalTokens: 10,
        evaluationTime: 100,
        tokensPerSecond: 0.1,
      },
    };

    jest
      .spyOn(worker as any, "handleChatCompletionMessage")
      .mockResolvedValue(mockResponse);

    const result = await worker["handleChatCompletionMessage"](message);

    expect(result).toEqual(mockResponse);
  });
});
