import { IRepository } from "./irepository.interface";
import { Job } from "../../domain/entities/jobs/job.entity";

/**
 * Interface para repositórios especializados em gerenciamento de filas
 * @template T - Tipo da entidade Queue
 * @template J - Tipo da entidade Job (padrão: Job)
 */
export interface IQueueRepository<T, J = Job> extends IRepository<T> {
  /**
   * Obtém o próximo job disponível para processamento
   * @returns Promise contendo o próximo job ou null se não houver jobs disponíveis
   */
  getNextJob(): Promise<Result<J | null>>;

  /**
   * Marca um job como concluído com sucesso
   * @param id - Identificador do job
   * @param result - Resultado do processamento do job
   * @returns Promise vazia indicando sucesso da operação
   */
  markJobAsCompleted(id: string, result: any): Promise<void>;

  /**
   * Marca um job como falhou
   * @param id - Identificador do job
   * @param error - Erro que ocorreu durante o processamento
   * @returns Promise vazia indicando sucesso da operação
   */
  markJobAsFailed(id: string, error: Error): Promise<void>;

  /**
   * Marca um job como iniciado
   * @param id - Identificador do job
   * @returns Promise vazia indicando sucesso da operação
   */
  markJobAsStarted(id: string): Promise<void>;

  /**
   * Marca um job como atrasado
   * @param id - Identificador do job
   * @param delayUntil - Data até quando o job deve ser atrasado
   * @returns Promise vazia indicando sucesso da operação
   */
  markJobAsDelayed(id: string, delayUntil: Date): Promise<void>;
}
