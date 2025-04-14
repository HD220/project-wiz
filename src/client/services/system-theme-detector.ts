export type Theme = "dark" | "light" | "system";

export type MatchMediaFn = (query: string) => MediaQueryList;

export function detectSystemTheme(
  matchMediaFn?: MatchMediaFn
): Theme {
  const matchMedia =
    matchMediaFn ||
    (typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia.bind(window)
      : undefined);

  if (!matchMedia) {
    // Fallback seguro para ambientes sem window/matchMedia (SSR, testes)
    return "light";
  }

  try {
    if (matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  } catch {
    // Em caso de erro inesperado, retorna fallback seguro
    return "light";
  }
}