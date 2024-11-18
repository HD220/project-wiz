import OpenAI, { toFile } from "openai";
import { createOpenAI } from "./createOpenAI";
import { BatchProcessResponse, ChatCompletionResponse } from "./types";
import { Readable } from "stream";
import { Stream } from "openai/streaming";

const PROMPTS = {
  analyse: {
    system: {
      role: "system",
      content:
        "You are an assistant specialized in summarizing code. Given a block of code, provide a high-level description using only relevant keywords and concepts, avoiding step-by-step explanations. Keep the description under 250 characters.",
    },
    user: {
      role: "user",
      content: "",
    },
  },
} as const;

export type PromptTypes = keyof typeof PROMPTS;

export class OpenAIClient {
  private connection: OpenAI;
  constructor() {
    this.connection = createOpenAI();
  }

  preparePrompt({
    message,
    model = "gpt-3.5-turbo",
    type = "analyse",
    max_tokens = 250,
    creativity = 0.5,
  }: {
    message: string;
    type?: PromptTypes;
    model?: string;
    max_tokens?: number;
    creativity?: number;
  }): OpenAI.ChatCompletionCreateParams {
    const temperature = 0.1 + creativity * (1.0 - 0.1);
    const top_p = 1.0 - creativity * (1.0 - 0.1);

    return {
      max_completion_tokens: max_tokens,
      temperature,
      top_p,
      n: 1,
      model,
      messages: [
        PROMPTS[type].system,
        {
          role: PROMPTS[type].user.role,
          content: `${PROMPTS[type].user.content} ${message}`,
        },
      ],
    };
  }

  prepareBatch({
    custom_id,
    body,
  }: {
    custom_id: string;
    body: OpenAI.ChatCompletionCreateParams;
  }): {
    custom_id: string;
    method: "POST";
    url: "/v1/chat/completions";
    body: OpenAI.ChatCompletionCreateParams;
  } {
    return {
      custom_id,
      method: "POST",
      url: "/v1/chat/completions",
      body,
    };
  }

  async chatCompletionStream(prompt: OpenAI.ChatCompletionCreateParams) {
    const request = this.connection.chat.completions.create(prompt, {
      stream: true,
    });
    const transformStream = new TransformStream({
      transform(
        chunk: OpenAI.Chat.Completions.ChatCompletionChunk,
        controller
      ) {
        const transformedChunk = {
          choices: chunk.choices.map((choice) => ({ ...choice.delta })),
          usage: chunk.usage?.total_tokens || 0,
        };
        controller.enqueue(transformedChunk);
      },
    });

    const completion =
      (await request) as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;
    const transformedStream = completion
      .toReadableStream()
      .pipeThrough(transformStream);
    return Stream.fromReadableStream<ChatCompletionResponse>(
      transformedStream,
      completion.controller
    );
  }

  async chatCompletion(
    prompt: OpenAI.ChatCompletionCreateParams
  ): Promise<ChatCompletionResponse> {
    const request = this.connection.chat.completions.create(prompt, {
      stream: false,
    });
    const completion =
      (await request) as OpenAI.Chat.Completions.ChatCompletion;
    return {
      choices: completion.choices.map((choice) => ({
        content: choice.message.content,
        refusal: choice.message.refusal,
        role: choice.message.role,
        tool_calls: choice.message.tool_calls,
      })),
      usage: completion.usage?.total_tokens || 0,
    };
  }

  async deleteFile(fileId: string) {
    await this.connection.files.del(fileId);
  }

  async createFile(data: string) {
    const file = await this.connection.files.create({
      file: await toFile(Readable.from(data)),
      purpose: "batch",
    });
    return file;
  }

  async createBatch(fileId: string) {
    const batch = await this.connection.batches.create({
      input_file_id: fileId,
      endpoint: "/v1/chat/completions",
      completion_window: "24h",
    });
    return batch;
  }

  async retrieveBatch(batchId: string) {
    const batch = await this.connection.batches.retrieve(batchId);
    if (
      batch.status === "failed" ||
      batch.status === "cancelled" ||
      batch.status === "expired"
    )
      throw new Error(`Batch ${batch.status}`);
    if (
      batch.status === "cancelling" ||
      batch.status === "finalizing" ||
      batch.status === "validating" ||
      batch.status === "in_progress"
    )
      throw new Error(`Batch ${batch.status}`);
    return await this.retrieveBatchProcess(batch.output_file_id!);
  }

  private async retrieveBatchProcess(fileId: string) {
    const fileResponse = await this.connection.files.content(fileId);
    const fileContents = await fileResponse.text();
    const lines: BatchProcessResponse[] = fileContents
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        return JSON.parse(line);
      });
    return lines;
  }
}
