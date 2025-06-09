import { Job } from "../../core/domain/entities/job/job.entity";
import { JobStatus } from "../../core/domain/entities/job/value-objects/job-status.vo";

// Usar process.on('message') e process.send() para comunicação IPC
process.on("message", async (message: { type: string; job: Job }) => {
  if (message.type === "processJob") {
    const job = message.job;
    try {
      // Simular o processamento da job
      // No mundo real, aqui você chamaria a lógica de negócio da job
      console.log(`Worker processando job: ${job.id.value}`);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula trabalho

      // Simular sucesso
      process.send?.({
        type: "jobCompleted",
        jobId: job.id.value,
        status: JobStatus.create("FINISHED").value,
      });
    } catch (error: unknown) {
      // Simular falha
      process.send?.({
        type: "jobFailed",
        jobId: job.id.value,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

console.log("Job Processor Worker iniciado.");
