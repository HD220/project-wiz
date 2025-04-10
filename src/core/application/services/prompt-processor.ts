import { Prompt, PromptParameter, PromptParameters, PromptValues } from '../../domain/entities/prompt';

export function applyPrompt(prompt: Prompt, values: PromptValues): string {
  const parameters: PromptParameters = prompt.parameters || {};

  validatePromptValues(parameters, values);

  const convertedValues = convertPromptValues(parameters, values);

  return replacePromptPlaceholders(prompt.text, parameters, convertedValues);
}

function validatePromptValues(
  parameters: PromptParameters,
  values: PromptValues
): void {
  for (const [name, param] of Object.entries(parameters)) {
    const value = values[name];

    if (param.required && (value === undefined || value === null)) {
      throw new Error(`Variável obrigatória "${name}" não fornecida.`);
    }

    if (value === undefined || value === null) {
      continue;
    }

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
        if (!(value instanceof Date)) {
          if (typeof value === 'string' || typeof value === 'number') {
            if (isNaN(Date.parse(String(value)))) {
              throw new Error(`Variável "${name}" deve ser uma data válida.`);
            }
          } else {
            throw new Error(`Variável "${name}" deve ser uma data válida.`);
          }
        }
        break;
      case 'enum':
        if (!param.enum || !Array.isArray(param.enum)) {
          throw new Error(`Enumeração não definida para variável "${name}".`);
        }
        if (!param.enum.includes(value as string)) {
          throw new Error(
            `Valor inválido para "${name}". Esperado um dos: ${param.enum.join(', ')}.`
          );
        }
        break;
      default:
        throw new Error(`Tipo de variável desconhecido: ${param.type}`);
    }
  }
}

function convertPromptValues(
  parameters: PromptParameters,
  values: PromptValues
): Record<string, string> {
  const converted: Record<string, string> = {};

  for (const [name, param] of Object.entries(parameters)) {
    const value = values[name];

    if (value === undefined || value === null) {
      continue;
    }

    let stringValue: string;

    switch (param.type) {
      case 'date':
        stringValue =
          value instanceof Date
            ? value.toISOString()
            : new Date(value as string | number).toISOString();
        break;
      case 'boolean':
      case 'number':
      case 'string':
      case 'enum':
        stringValue = String(value);
        break;
      default:
        stringValue = String(value);
    }

    converted[name] = sanitizeValue(stringValue);
  }

  return converted;
}

function replacePromptPlaceholders(
  text: string,
  parameters: PromptParameters,
  convertedValues: Record<string, string>
): string {
  let finalText = text;

  for (const name of Object.keys(parameters)) {
    const value = convertedValues[name];

    if (value === undefined) {
      continue;
    }

    const regex = new RegExp(`{{\\s*${escapeRegExp(name)}\\s*}}`, 'g');
    finalText = finalText.replace(regex, value);
  }

  return finalText;
}

function sanitizeValue(value: string): string {
  return value.replace(/[{}]/g, '');
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}