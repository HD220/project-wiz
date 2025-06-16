/**
 * Retorna uma promise que resolve após o tempo especificado
 * @param ms Tempo em milissegundos
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
