import { createProcessor } from "@/services/bullmq/createProcessor";
import { WorkerInputData } from "./types";
import { handleCloning } from "./handleCloning";
import { handleCollecting } from "./handleCollecting";
import { handleVersioning } from "./handleVersioning";
import { handleCompleted } from "./handleCompleted";

export const processor = createProcessor<WorkerInputData>(
  {
    cloning: handleCloning,
    collecting: handleCollecting,
    versioning: handleVersioning,
    completed: handleCompleted,
  },
  { defaultStep: "cloning" }
);
