import betterSqlite3 from "better-sqlite3";
import { SqliteQueue } from "../queue/sqlite.queue";
import { SqliteWorker } from "../worker/sqlite.worker";
import { Worker } from "../worker/worker.interface";

// Criar conexão com o SQLite
const db = betterSqlite3(":memory:");

// Exemplo de uso da fila
async function exampleUsage() {
  // Criar uma fila
  const queue = new SqliteQueue<string>(db);

  const agent = new Worker(queue, async (job) => {
    await job.moveToDelay(1000);
    return;
  });

  // Criar um worker para processar os jobs
  const worker = new SqliteWorker<string>(
    queue,
    async (email) => {
      console.log(`Processando email: ${email}`);
      // Simular processamento
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Email ${email} processado com sucesso`);
    },
    10000 // 10 segundos de retryDelay
  );

  // Iniciar o worker
  await worker.start();

  // Adicionar jobs na fila
  await queue.add("email1@example.com", { priority: 1 });
  await queue.add("email2@example.com", { delay: 5000 }); // Delay de 5 segundos
  await queue.add("email3@example.com", { attempts: 3 });

  // Manter o processo rodando por 30 segundos
  await new Promise((resolve) => setTimeout(resolve, 30000));

  // Parar o worker
  await worker.stop();
}

exampleUsage().catch(console.error);
