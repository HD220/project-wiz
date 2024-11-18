// Lista de palavras comuns a serem ignoradas
const stopWords = [
  "get",
  "fetch",
  "create",
  "set",
  "verify",
  "post",
  "delete",
  "put",
  "jwt",
  "map",
  "by",
  "generate",
  "key",
  "build",
  "a",
  "as",
  "for",
];

// Tokenização - separa palavras de identificadores por CamelCase ou underscores
export function tokenize(identifier: string) {
  return identifier
    .split(/(?=[A-Z][a-z])|(?<=[a-z])(?=[A-Z])|[_\-\s]/)
    .map((word) => word.toLowerCase())
    .filter((word) => !stopWords.includes(word)); // Filtra palavras comuns
}

// Agrupamento de tokens
export function groupTokens(identifiers: string[]): {
  [token: string]: number;
} {
  const tokenFrequency = {};

  identifiers.forEach((id) => {
    const tokens = tokenize(id);
    tokens.forEach((token) => {
      if (!tokenFrequency[token]) {
        tokenFrequency[token] = 0;
      }
      tokenFrequency[token]++;
    });
  });

  return tokenFrequency;
}

// Seleção de tokens relevantes para gerar o nome do módulo
export function selectTokens(
  tokenFrequency: { [token: string]: number },
  minFrequency = 1
) {
  return Object.entries(tokenFrequency)
    .filter(([, freq]) => freq >= minFrequency)
    .sort((a, b) => b[1] - a[1]) // Ordena pelos tokens mais frequentes
    .map(([token]) => capitalize(token))
    .slice(0, 3);
}

// Função utilitária para capitalizar a primeira letra
export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Geração do nome do módulo
export function generateModuleName(identifiers: string[]) {
  const tokenFrequency = groupTokens(identifiers);
  const selectedTokens = selectTokens(tokenFrequency);

  return (selectedTokens.join("") || "Unknown") + "Module";
}
