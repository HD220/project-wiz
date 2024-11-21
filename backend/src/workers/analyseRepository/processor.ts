import { createProcessor } from "@/services/bullmq/createProcessor";
import { WorkerInputData } from "./types";
import { handleCollecting } from "./handleCollecting";
import { handleVersioning } from "./handleReadFiles";
import { handleCompleted } from "./handleCompleted";
import { handleExtractBlocks } from "./handleExtractBlocks";

export const processor = createProcessor<WorkerInputData>(
  {
    "read-files": handleCollecting,
    "extract-blocks": handleExtractBlocks,
    "extract-groups": handleExtractGroups,
    completed: handleCompleted,
  },
  { defaultStep: "read-files" }
);
