import { Octokit } from "octokit";

/**
 * Serviço para integração com a API do GitHub.
 * 
 * Suporta modo autenticado (com token) e anônimo (sem token).
 * O token pode ser configurado dinamicamente em tempo de execução.
 */
class GithubService {
  private octokit: Octokit;
  private token: string | null = null;

  constructor() {
    // Inicializa em modo anônimo por padrão
    this.octokit = new Octokit();
  }

  /**
   * Define ou remove o token de acesso do GitHub.
   * 
   * - Se `token` for uma string, ativa o modo autenticado.
   * - Se `token` for `null`, usa modo anônimo (somente operações públicas).
   * 
   * @param token Personal Access Token ou null para modo anônimo
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      this.octokit = new Octokit({ auth: token });
    } else {
      this.octokit = new Octokit();
    }
  }

  /**
   * Cria um Pull Request autenticado no repositório especificado.
   * 
   * @param owner Proprietário do repositório
   * @param repo Nome do repositório
   * @param title Título do Pull Request
   * @param head Branch de origem (ex: feature-branch)
   * @param base Branch de destino (ex: main)
   * @param body (opcional) Descrição do Pull Request
   * @returns Dados do PR criado ou erro detalhado
   */
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ) {
    try {
      const response = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body,
        // Futuro: adicionar suporte a rascunho (draft: true)
        // Futuro: adicionar reviewers via API após criação
      });
      return response.data;
    } catch (error: any) {
      // Tratamento detalhado de erros comuns
      if (error.status === 422) {
        // Exemplo: branch inexistente ou PR já existente
        return {
          error: true,
          message: "Falha na criação do Pull Request: verifique se as branches existem e se já não há um PR aberto entre elas.",
          details: error.response?.data || error.message,
        };
      } else if (error.status === 403) {
        return {
          error: true,
          message: "Permissão negada para criar Pull Request. Verifique o token e permissões.",
          details: error.response?.data || error.message,
        };
      } else {
        return {
          error: true,
          message: "Erro inesperado ao criar Pull Request.",
          details: error.response?.data || error.message,
        };
      }
    }
  }

  /**
   * Obtém uma issue do repositório especificado.
   */
  async getIssue(owner: string, repo: string, issue_number: number) {
    try {
      const response = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao obter issue:", error);
      throw error;
    }
  }
}

export default GithubService;
