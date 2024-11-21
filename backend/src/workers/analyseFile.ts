import { BlockInfo } from "@/services/anyliser/types";
import {
  AddRecordsParams,
  DefaultEmbeddingFunction,
  Embedding,
  IncludeEnum,
  Metadata,
} from "chromadb";
import { createQueue, createWorker } from "@/services/bullmq";
import { createChroma } from "@/services/chroma";
import { chatCompletionQueue } from "./chatCompletion";
import path from "node:path";
import { DelayedError, WaitingChildrenError } from "bullmq";
import { randomUUID } from "node:crypto";

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

    // await chromaClient.deleteCollection({ name: "blocks" });
    const collection = await chromaClient.getOrCreateCollection({
      name: "blocks",
      embeddingFunction: new DefaultEmbeddingFunction(),
    });

    switch (step) {
      case "validating": {
        console.log(job.name, "starting with data", job.data);
        const data = await Promise.all(
          blocks.map(async (block) => {
            return collection.get({
              include: [
                "embeddings",
                "documents",
                "metadatas",
              ] as IncludeEnum[],
              where: {
                blockHash: block.blockHash,
              },
            });
          })
        );

        const docs = data
          .filter((block) => block.ids.length >= 1)
          .map((block) => ({
            id: block.ids[0],
            document: block.documents[0],
            embedding: block.embeddings?.[0],
            metadata: block.metadatas[0],
          }));

        console.log(job.name, " existing data ", docs.length);

        const undocumentedBlock = blocks.filter(
          (block) =>
            !docs.some((doc) => doc.metadata?.blockHash === block.blockHash)
        );

        console.log(job.name, " newdata data ", undocumentedBlock.length);

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

        await job.moveToDelayed(Date.now() + 10, token);
        throw new DelayedError();
      }
      case "in_progress": {
        console.log(job.name, " waiting children");
        const shouldWait = await job.moveToWaitingChildren(token!);
        if (shouldWait) throw new WaitingChildrenError();

        const childrenResult = await job.getChildrenValues();
        const promptResults:
          | { id: string; result: string; usage: number }[]
          | undefined = Object.entries(childrenResult).map(
          ([, result]) =>
            result as { id: string; result: string; usage: number }[]
        )[0];

        try {
          //add undocumentedBlock
          if (promptResults?.length) {
            console.log(
              job.name,
              " add new ",
              promptResults.length,
              " blocks into chroma"
            );
            const doc = promptResults.reduce(
              (acc, cur) => ({
                ids: [...(acc.ids || []), randomUUID()],
                documents: [...(acc.documents || []), cur.result || ""],
                metadatas: [
                  ...(Array.isArray(acc.metadatas) ? acc.metadatas : []),
                  {
                    blockHash: cur.id,
                    commitHash,
                  },
                ],
              }),
              {} as AddRecordsParams
            );
            await collection.add(doc);
          }

          //replicate documentedDoc
          if (documents.length) {
            console.log(
              job.name,
              " replicate ",
              documents.filter((doc) => doc.metadata?.commitHash !== commitHash)
                .length,
              " blocks into chroma"
            );

            // const doc = documents
            //   .filter((doc) => doc.metadata?.commitHash !== commitHash)
            //   .reduce(
            //     (acc, cur) => ({
            //       ids: [...(acc.ids || []), randomUUID()],
            //       documents: [...(acc.documents || []), cur.document || ""],
            //       embeddings: [
            //         ...(Array.isArray(acc.embeddings) ? acc.embeddings : []),
            //         cur.embedding || [],
            //       ] as Embeddings,
            //       metadata: [
            //         ...(Array.isArray(acc.metadatas) ? acc.metadatas : []),
            //         {
            //           ...cur.metadata,
            //           commitHash,
            //         },
            //       ],
            //     }),
            //     {} as AddRecordsParams
            //   );
            await collection.add(
              createAddRecordsParamsForDocuments(documents, commitHash)
            );
          }
        } catch (error) {
          console.error({ error });
        }

        await job.updateData({
          ...job.data,
          step: "completed",
        });
        await job.moveToDelayed(Date.now() + 10, token);
        throw new DelayedError();
      }
      default:
        console.log("analiseFile completed!");
        break;
    }
  }
);

function createAddRecordsParamsForDocuments(documents, commitHash) {
  const initialParams: AddRecordsParams = {
    ids: [],
    documents: [],
    embeddings: [],
    metadatas: [],
  };

  return documents
    .filter((doc) => doc.metadata?.commitHash !== commitHash)
    .reduce((acc, cur) => {
      acc.ids.push(randomUUID());
      acc.documents.push(cur.documents || "");
      acc.embeddings.push(cur.embeddings || []);
      acc.metadatas.push({
        ...cur.metadatas,
        commitHash,
      });
      return acc;
    }, initialParams);
}
