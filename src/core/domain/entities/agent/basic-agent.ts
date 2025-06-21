import { Agent } from "./agent";
import { Job } from "./interfaces/job.interface";
import { Tool } from "./interfaces/tool.interface";

export class BasicAgent extends Agent {
  constructor() {
    super();
  }

  async process(job: Job): Promise<any> {
    try {
      // Implementação básica de processamento de job
      console.log(`Processing job ${job.name} with payload:`, job.payload);

      // Aqui seria feita a integração com a LLM
      // e o uso das tools registradas

      return { success: true, jobId: job.id };
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  }
}
