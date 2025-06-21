import { Job } from "../../domain/entities/jobs/job.entity";

/**
 * Interface para processadores de jobs genéricos
 * @template Input - Tipo de dados de entrada do job
 * @template Output - Tipo de dados de saída do job
 */
export interface IProcessor<Input, Output> {
  /**
   * Processa um job e retorna o resultado
   * @param job - Job a ser processado
   * @param input - Dados de entrada para o processamento
   * @returns Promise contendo o resultado do processamento
   */
  process(job: Job, input: Input): Promise<Output>;
}
