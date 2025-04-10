import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Função utilitária para mesclar classes Tailwind com clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Executa uma função assíncrona com tentativas automáticas e backoff exponencial.
 * @param fn Função assíncrona a ser executada.
 * @param maxRetries Número máximo de tentativas (default: 3).
 * @param initialDelay Delay inicial em ms (default: 500).
 * @param backoffFactor Fator de multiplicação do delay (default: 2).
 * @returns Resultado da função assíncrona, ou lança o último erro após todas as tentativas.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 500,
  backoffFactor = 2
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;
  let lastError: unknown;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;
      if (attempt >= maxRetries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }

  throw lastError;
}
