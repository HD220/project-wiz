import { PromptQueueServicePort } from '../../domain/ports/PromptQueueServicePort';
import { PromptQueueRepositoryPort } from '../../domain/ports/PromptQueueRepositoryPort';
import { LLMServicePort } from '../../domain/ports/LLMServicePort';
import { PromptTask } from '../../domain/entities/PromptTask';
import { PromptStatus } from '../../domain/entities/PromptStatus';

export class PromptQueueService implements PromptQueueServicePort {
  private fila: PromptTask[] = [];
  private processando = false;

  constructor(
    private readonly repository: PromptQueueRepositoryPort,
    private readonly llmService: LLMServicePort
  ) {}

  async enfileirarPrompt(prompt: PromptTask): Promise<void> {
    prompt.status = PromptStatus.PENDENTE;
    this.fila.push(prompt);
    this.fila.sort((a, b) => {
      if (b.prioridade !== a.prioridade) {
        return b.prioridade - a.prioridade;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    await this.repository.salvarPrompt(prompt);
    await this.repository.persistirFila(this.fila);
    if (!this.processando) {
      this.processarFila();
    }
  }

  async priorizarPrompt(id: string, prioridade: number): Promise<void> {
    const prompt = this.fila.find(p => p.id === id);
    if (!prompt) return;
    prompt.prioridade = prioridade;
    this.fila.sort((a, b) => {
      if (b.prioridade !== a.prioridade) {
        return b.prioridade - a.prioridade;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    await this.repository.atualizarPrompt(prompt);
    await this.repository.persistirFila(this.fila);
  }

  async pausarPrompt(id: string): Promise<void> {
    const prompt = this.fila.find(p => p.id === id);
    if (!prompt) return;
    if (prompt.status === PromptStatus.PENDENTE || prompt.status === PromptStatus.EM_PROCESSAMENTO) {
      prompt.status = PromptStatus.PAUSADO;
      await this.repository.atualizarPrompt(prompt);
      await this.repository.persistirFila(this.fila);
    }
  }

  async retomarPrompt(id: string): Promise<void> {
    const prompt = this.fila.find(p => p.id === id);
    if (!prompt) return;
    if (prompt.status === PromptStatus.PAUSADO) {
      prompt.status = PromptStatus.PENDENTE;
      this.fila.sort((a, b) => {
        if (b.prioridade !== a.prioridade) {
          return b.prioridade - a.prioridade;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
      await this.repository.atualizarPrompt(prompt);
      await this.repository.persistirFila(this.fila);
      if (!this.processando) {
        this.processarFila();
      }
    }
  }

  async cancelarPrompt(id: string): Promise<void> {
    const prompt = this.fila.find(p => p.id === id);
    if (!prompt) return;
    prompt.status = PromptStatus.CANCELADO;
    await this.llmService.cancelarPrompt(id).catch(() => {});
    await this.repository.atualizarPrompt(prompt);
    await this.repository.persistirFila(this.fila);
  }

  async reordenarPrompt(id: string, novaPosicao: number): Promise<void> {
    const index = this.fila.findIndex(p => p.id === id);
    if (index === -1) return;
    const [prompt] = this.fila.splice(index, 1);
    this.fila.splice(novaPosicao, 0, prompt);
    await this.repository.persistirFila(this.fila);
  }

  async listarFila(): Promise<PromptTask[]> {
    return this.fila;
  }

  private async processarFila(): Promise<void> {
    if (this.processando) return;
    this.processando = true;

    while (true) {
      const proximo = this.fila.find(p => p.status === PromptStatus.PENDENTE);
      if (!proximo) break;

      proximo.status = PromptStatus.EM_PROCESSAMENTO;
      proximo.startedAt = new Date();
      await this.repository.atualizarPrompt(proximo);

      try {
        await this.llmService.enviarPrompt(proximo);
        proximo.status = PromptStatus.CONCLUIDO;
      } catch (error) {
        proximo.status = PromptStatus.ERRO;
      }

      proximo.finishedAt = new Date();
      await this.repository.atualizarPrompt(proximo);
      await this.repository.persistirFila(this.fila);
    }

    this.processando = false;
  }
}