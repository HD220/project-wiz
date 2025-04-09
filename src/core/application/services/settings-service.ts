export class SettingsService {
  /**
   * Retorna o número máximo de prompts permitidos por usuário.
   */
  static async getMaxPromptsPerUser(): Promise<number> {
    // Futuramente buscar do backend/config
    return 100;
  }

  /**
   * Retorna o tamanho máximo permitido para o conteúdo do prompt.
   */
  static async getMaxPromptContentLength(): Promise<number> {
    return 10000;
  }

  /**
   * Retorna o número máximo de variáveis permitidas por prompt.
   */
  static async getMaxVariablesPerPrompt(): Promise<number> {
    return 20;
  }

  /**
   * Retorna a lista de palavras proibidas no conteúdo do prompt.
   */
  static async getForbiddenWords(): Promise<string[]> {
    return ["senha", "password", "token", "chave-secreta"];
  }
}