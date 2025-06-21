import { QueueModule } from "@/infrastructure/queue/queue.module";
import { IProcessor } from "@/core/ports/queue/iprocessor.interface";
import { Result } from "@/shared/result";
import { Job } from "@/core/domain/entities/jobs/job.entity";
import { JsonLogger } from "@/infrastructure/services/logger/json-logger.service";
import { LogLevel } from "@/core/ports/logger/ilogger.interface";

// 1. Definir um processador de exemplo com tratamento de erros e retry
class EmailProcessor
  implements IProcessor<{ email: string; subject: string }, boolean>
{
  private logger = new JsonLogger("EmailProcessor");

  async process(
    job: Job,
    input: { email: string; subject: string }
  ): Promise<boolean> {
    const jobLogger = this.logger.withJobContext(job);

    try {
      jobLogger.info(`Iniciando processamento de email para: ${input.email}`, {
        subject: input.subject,
        status: job.getStatus().current,
      });

      // Simula envio de email com possível erro
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simula erro aleatório em 20% das vezes
          if (Math.random() < 0.2) {
            jobLogger.warn("Falha simulada no envio do email", {
              email: input.email,
            });
            reject(new Error("Falha no servidor SMTP"));
          } else {
            resolve(true);
          }
        }, 1000);
      });

      jobLogger.info(`Email enviado com sucesso para: ${input.email}`);
      return true;
    } catch (error: unknown) {
      const err = error as Error;
      jobLogger.error("Falha ao processar email", {
        error: err.message,
        stack: err.stack,
      });
      throw err; // WorkerService fará o retry exponencial
    }
  }
}

// 2. Demonstração de uso com todas as novas funcionalidades
async function demonstrateQueueUsage() {
  // Criar logger para a demonstração
  const logger = new JsonLogger("QueueExample");

  try {
    logger.info("Iniciando demonstração do sistema de filas");

    // Criar instância do módulo
    const queueModule = new QueueModule();

    // Configurar processadores
    const processors = new Map<string, IProcessor<any, any>>();
    processors.set("email-queue", new EmailProcessor());

    // Inicializar o módulo
    await queueModule.initialize(processors);
    logger.info("Módulo de filas inicializado com sucesso");

    // Adicionar jobs à fila com diferentes prioridades
    const job1 = await queueModule.addJob("email-queue", {
      id: "job1",
      status: "WAITING",
      priority: 5, // Prioridade média
      email: "user1@example.com",
      subject: "Bem-vindo ao nosso serviço",
    });

    const job2 = await queueModule.addJob("email-queue", {
      id: "job2",
      status: "WAITING",
      priority: 8, // Alta prioridade
      email: "user2@example.com",
      subject: "Confirmação de cadastro",
    });

    const job3 = await queueModule.addJob("email-queue", {
      id: "job3",
      status: "WAITING",
      priority: 2, // Baixa prioridade
      email: "user3@example.com",
      subject: "Promoção especial",
    });

    logger.info("Jobs adicionados com sucesso", {
      jobIds: [job1.getId(), job2.getId(), job3.getId()],
      priorities: [job1.getPriority(), job2.getPriority(), job3.getPriority()],
    });

    // Monitorar processamento (simulação)
    setTimeout(() => {
      logger.info("Verificando status dos jobs...");
      const worker = queueModule.getWorkerService("email-queue");
      if (worker) {
        logger.info("Worker está ativo e processando jobs");
      }
    }, 3000);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Erro durante a demonstração", {
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }
}

// Executar demonstração
demonstrateQueueUsage().catch((error: unknown) => {
  new JsonLogger("Main").error("Falha na execução da demonstração", {
    error: (error as Error).message,
  });
});
