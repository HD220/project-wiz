import { createQueue, createWorker } from "@/services/bullmq";
import { OpenAIClient } from "@/services/openai";
import { BatchProcessResponse } from "@/services/openai/types";
import { DelayedError } from "bullmq";
import { ChatCompletionCreateParams } from "openai/resources";

const MAX_ATTEMPT = 10;
const INITIAL_DELAY = 60 * 1000; // 1 minuto em milissegundos
const BACKOFF_FACTOR = 2; // Fator de backoff
const MAX_DELAY = 2 * 60 * 60 * 1000; // 2 horas em milissegundos
const openai = new OpenAIClient();

export type ChatCompletionWorkerData = {
  messages: {
    id: string;
    content: string;
    type: "analyse";
  }[];
  is_batch?: boolean;
  progress?: {
    step?: "validating" | "in_progress" | "finalizing" | "completed";
    prompts?: {
      id: string;
      prompt: ChatCompletionCreateParams;
    }[];
    response?: ChatCompletionWorkerResult[];
    batch_id?: string;
    batch_file_id?: string;
    attempt?: number;
  };
};

export type ChatCompletionWorkerResult = {
  id: string;
  result: string;
  usage: number;
};

export const chatCompletionQueue = createQueue<
  ChatCompletionWorkerData,
  ChatCompletionWorkerResult[]
>("chat-completion");

export const chatCompletionWorker = createWorker<
  ChatCompletionWorkerData,
  ChatCompletionWorkerResult[]
>("chat-completion", async (job, token) => {
  const { messages = [] } = job.data;
  const {
    step = "validating",
    attempt = 0,
    batch_id,
  } = job.data.progress || {};

  if (attempt >= MAX_ATTEMPT)
    throw new Error("Numero maximo de tentativas atingida.");

  switch (step) {
    case "validating": {
      const prompts = messages.map((msg) => ({
        id: msg.id,
        prompt: openai.preparePrompt({
          message: msg.content,
          type: msg.type,
        }),
      }));

      const batchPrompts = prompts.map((prompt) =>
        openai.prepareBatch({
          custom_id: prompt.id,
          body: prompt.prompt,
        })
      );
      const batchFile = await openai.createFile(
        batchPrompts.map((p) => JSON.stringify(p)).join("\n")
      );
      const batch = await openai.createBatch(batchFile.id);

      await job.updateData({
        ...job.data,
        progress: {
          ...job.data.progress,
          step: "in_progress",
          batch_id: batch.id,
        },
      });

      await job.moveToDelayed(Date.now() + 10, token);
      throw new DelayedError();
    }
    case "in_progress": {
      let delay = 100;
      try {
        const response: BatchProcessResponse[] = await openai.retrieveBatch(
          batch_id!
        );
        await job.updateData({
          ...job.data,
          progress: {
            ...job.data.progress,
            response: response.map((resp) => ({
              id: resp.custom_id,
              result: resp.response.body.choices[0].message.content,
              usage: resp.response.body.usage.total_tokens,
            })),
            step: "completed",
          },
        });
      } catch (error) {
        console.error({ error });
        await job.updateData({
          ...job.data,
          progress: { ...job.data.progress, attempt: attempt + 1 },
        });
        delay = Math.min(
          INITIAL_DELAY * Math.pow(BACKOFF_FACTOR, attempt),
          MAX_DELAY
        );
      }

      console.log("chatCompletion delay", delay);
      await job.moveToDelayed(Date.now() + delay, token);
      throw new DelayedError();
    }
    default:
      console.log("chatCompletion completed!");
      return job.data.progress?.response || [];
  }
});
