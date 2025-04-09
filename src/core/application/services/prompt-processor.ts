import { Prompt } from '../../domain/entities/prompt';

/**
 * Tipos suportados para variáveis de prompt
 */
type PromptParameterType = 'string' | 'number' | 'boolean' | 'date' | 'enum';

/**
 * Definição de uma variável do prompt
 */
interface PromptParameter {
  type: PromptParameterType;
  required?: boolean;
  enum?: any[]; // para tipo enum
}

/**
 * Aplica variáveis a um prompt, validando e substituindo placeholders
 * @param prompt O objeto Prompt com texto e parâmetros
 * @param values Valores fornecidos para as variáveis
 * @returns Texto final com variáveis aplicadas
 */
export function applyPrompt(
  prompt: Prompt,
  values: Record<string, any>
): string {
  const parameters: Record<string, PromptParameter> = prompt.parameters || {};

  for (const [name, param] of Object.entries(parameters)) {
    const value = values[name];

    // Verifica obrigatoriedade
    if (param.required && (value === undefined || value === null)) {
      throw new Error(`Variável obrigatória "${name}" não fornecida.`);
    }

    // Ignora variáveis opcionais não fornecidas
    if (value === undefined || value === null) {
      continue;
    }

    // Validação de tipo
    switch (param.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(`Variável "${name}" deve ser uma string.`);
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          throw new Error(`Variável "${name}" deve ser um número.`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`Variável "${name}" deve ser um booleano.`);
        }
        break;
      case 'date':
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          throw new Error(`Variável "${name}" deve ser uma data válida.`);
        }
        break;
      case 'enum':
        if (!param.enum || !Array.isArray(param.enum)) {
          throw new Error(`Enumeração não definida para variável "${name}".`);
        }
        if (!param.enum.includes(value)) {
          throw new Error(
            `Valor inválido para "${name}". Esperado um dos: ${param.enum.join(', ')}.`
          );
        }
        break;
      default:
        throw new Error(`Tipo de variável desconhecido: ${param.type}`);
    }
  }

  let finalText = prompt.text;

  // Substituição dos placeholders
  for (const [name, param] of Object.entries(parameters)) {
    const value = values[name];

    if (value === undefined || value === null) {
      continue; // ignora variáveis opcionais não fornecidas
    }

    let stringValue: string;

    switch (param.type) {
      case 'date':
        stringValue =
          value instanceof Date
            ? value.toISOString()
            : new Date(value).toISOString();
        break;
      case 'boolean':
      case 'number':
        stringValue = String(value);
        break;
      case 'string':
      case 'enum':
        stringValue = String(value);
        break;
      default:
        stringValue = String(value);
    }

    // Sanitização básica para evitar injeções
    stringValue = sanitizeValue(stringValue);

    // Substitui todas as ocorrências do placeholder
    const regex = new RegExp(`{{\\s*${escapeRegExp(name)}\\s*}}`, 'g');
    finalText = finalText.replace(regex, stringValue);
  }

  return finalText;
}

/**
 * Sanitiza valores para evitar injeções no prompt
 * @param value Valor a ser sanitizado
 * @returns Valor seguro para inserção
 */
function sanitizeValue(value: string): string {
  // Remove chaves para evitar quebra de placeholders
  return value.replace(/[{}]/g, '');
}

/**
 * Escapa caracteres especiais para uso em regex
 * @param str String a ser escapada
 * @returns String escapada
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}