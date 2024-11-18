import { BlockInfo } from "@/services/anyliser/types";
import { createQueue, createWorker } from "../services/bullmq";
import {
  DefaultEmbeddingFunction,
  AddRecordsParams,
  Embedding,
  IncludeEnum,
  Metadata,
  Embeddings,
} from "chromadb";
import { randomUUID } from "crypto";
import { createChroma } from "@/services/chroma/createChroma";

import path from "node:path";
import { DelayedError, WaitingChildrenError } from "bullmq";
import { BatchProcessResponse } from "@/services/openai/types";
import { chatCompletionQueue } from "./chatCompletion";

const chromaClient = createChroma();

type Doc = {
  id: string;
  document: string | null;
  embedding: Embedding | undefined;
  metadata: Metadata | null;
};

export type AnalyseFileWorkerData = {
  commitHash: string;
  status: string;
  filePath: string;
  fileAnalysis: {
    imports: {
      name: string;
      path: string;
    }[];
    exports: string[];
    blocks: BlockInfo[];
  };
  documents?: Doc[];
  step?: "validating" | "in_progress" | "finalizing" | "completed";
};

export const analyseFileQueue =
  createQueue<AnalyseFileWorkerData>("analyse-file");

export const analyseFileWorker = createWorker<AnalyseFileWorkerData>(
  "analyse-file",
  async (job, token) => {
    const {
      commitHash,
      status,
      filePath,
      fileAnalysis,
      documents = [],
      step = "validating",
    } = job.data;
    const { blocks } = fileAnalysis;

    if (status === "D") return; // se arquivo foi deleteado ignora-o

    const collection = await chromaClient.getOrCreateCollection({
      name: "blocks",
      embeddingFunction: new DefaultEmbeddingFunction(),
    });

    switch (step) {
      case "validating": {
        const data = await Promise.all(
          blocks.map(async (block) =>
            collection.get({
              include: ["embeddings"] as IncludeEnum[],
              where: {
                $and: [{ blockHash: block.blockHash }],
              },
            })
          )
        );

        const docs = data.map((block) => ({
          id: block.ids[0],
          document: block.documents[0],
          embedding: block.embeddings?.[0],
          metadata: block.metadatas[0],
        }));

        const undocumentedBlock = blocks.filter(
          (block) =>
            !docs.some((doc) => doc.metadata?.blockHash === block.blockHash)
        );

        if (undocumentedBlock.length > 0) {
          await chatCompletionQueue.add(
            path.basename(filePath),
            {
              messages: undocumentedBlock.map((block) => ({
                id: block.blockHash,
                content: block.source,
                type: "analyse",
              })),
            },
            {
              parent: {
                id: job.id!,
                queue: job.queueQualifiedName,
              },
            }
          );
        }

        await job.updateData({
          ...job.data,
          step: "in_progress",
          documents: [...documents, ...docs],
        });
        await job.moveToDelayed(Date.now() + 100, token);
        throw new DelayedError();
      }
      case "in_progress": {
        const shouldWait = await job.moveToWaitingChildren(token!);

        if (shouldWait) throw new WaitingChildrenError();

        const childrenResult = await job.getChildrenValues();
        const promptResults: { id: string; response: BatchProcessResponse }[] =
          Object.entries(childrenResult).map(([, result]) => result);

        //add undocumentedBlock
        await collection.add(
          promptResults.reduce(
            (acc, cur) => ({
              ids: [...acc.ids, randomUUID()],
              documents: [
                ...(acc.documents || []),
                cur.response.response.body.choices[0].message.content,
              ],
              metadatas: [
                ...(Array.isArray(acc.metadatas) ? acc.metadatas : []),
                {
                  blockHash: cur.id,
                  commitHash,
                },
              ],
            }),
            {} as AddRecordsParams
          )
        );

        //replicate documentedDoc
        await collection.add(
          documents.reduce(
            (acc, cur) => ({
              ids: [...acc.ids, randomUUID()],
              documents: [...(acc.documents || []), cur.document || ""],
              embeddings: [
                ...(Array.isArray(acc.embeddings) ? acc.embeddings : []),
                cur.embedding || null,
              ] as Embeddings,
              metadata: [
                ...(Array.isArray(acc.metadatas) ? acc.metadatas : []),
                {
                  ...cur.metadata,
                  commitHash,
                },
              ],
            }),
            {} as AddRecordsParams
          )
        );

        await job.moveToDelayed(Date.now() + 100, token);
        throw new DelayedError();
      }
      default:
        console.log("analiseFile completed!");
        break;
    }
  }
);
