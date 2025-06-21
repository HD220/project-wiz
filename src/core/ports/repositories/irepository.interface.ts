/**
 * Interface base para repositórios com operações CRUD básicas
 * @template T - Tipo da entidade gerenciada pelo repositório
 * @template ID - Tipo do identificador da entidade (padrão: string)
 */
export interface IRepository<T, ID = string> {
  /**
   * Cria uma nova entidade no repositório
   * @param entity - Entidade a ser criada
   * @returns Promise contendo a entidade criada
   */
  create(entity: T): Promise<T>;

  /**
   * Busca uma entidade pelo seu identificador
   * @param id - Identificador da entidade
   * @returns Promise contendo a entidade encontrada ou null se não existir
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Atualiza uma entidade existente
   * @param entity - Entidade com os dados atualizados
   * @returns Promise contendo a entidade atualizada
   */
  update(entity: T): Promise<T>;

  /**
   * Remove uma entidade do repositório
   * @param id - Identificador da entidade a ser removida
   * @returns Promise indicando sucesso da operação
   */
  delete(id: ID): Promise<boolean>;

  /**
   * Lista todas as entidades do repositório
   * @returns Promise contendo array com todas as entidades
   */
  findAll(): Promise<T[]>;
}
