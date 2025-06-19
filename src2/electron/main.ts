import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { JobDrizzleRepository } from '../infrastructure/repositories/JobDrizzleRepository';
import { QueueService } from '../core/application/services/QueueService';
import type { NewJob, Job } from '../core/domain/schemas';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { jobsTable, projectsTable } from '../core/domain/schemas'; // Necessário para o schema do drizzle

// Lógica de definição de caminho do DB (similar ao JobDrizzleRepository, mas centralizada aqui)
let dbPath: string;
const appName = 'ProjectWiz2'; // Ou buscar do package.json
const dbFileName = 'project-wiz-data.sqlite.db';

if (process.env.NODE_ENV === 'development') {
  // Em dev, app.getAppPath() é src2/. Queremos src2/infrastructure/database/project-wiz-data.sqlite.db
  // No entanto, para consistência e evitar problemas com o hot reload que pode reiniciar o main e perder o DB em memória,
  // vamos usar um arquivo persistente também em dev, mas em um local previsível.
  // Usar a pasta raiz do projeto (src2) para o DB em dev.
  dbPath = path.join(app.getAppPath(), 'dev-project-wiz-data.sqlite.db');
} else {
  // Em produção, userData é o local apropriado.
  dbPath = path.join(app.getPath('userData'), dbFileName);
}
console.log(`[DB Main] Usando banco de dados em: ${dbPath}`);

const sqliteInstance = new Database(dbPath);
// Aplicar journal_mode = WAL para melhor concorrência e performance, essencial para SQLite com múltiplos acessos.
sqliteInstance.pragma('journal_mode = WAL');

const mainDbInstance: BetterSQLite3Database = drizzle(sqliteInstance, { schema: { jobsTable, projectsTable } });


// Instâncias dos serviços
const jobRepository = new JobDrizzleRepository(mainDbInstance); // Injetar a instância do DB
const queueService = new QueueService(jobRepository);


// Configuração de caminhos para Electron Vite (padrão do template)
if (process.env.NODE_ENV === 'production') {
  process.env.DIST = path.join(__dirname);
} else {
  // Em dev, __dirname é src2/electron.
}
process.env.DIST_ELECTRON = path.join(__dirname, '..');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? path.join(process.env.DIST_ELECTRON, '../public') : path.join(__dirname, '../renderer/public');


let win: BrowserWindow | null;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];


function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
    sqliteInstance.close(); // Fechar conexão com o DB ao sair
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  // Aplicar migrações ao iniciar (idealmente apenas se necessário)
  // Esta é uma forma simples; um sistema de migração mais robusto pode ser usado.
  try {
    const migrationsPath = process.env.NODE_ENV === 'development'
      ? path.join(app.getAppPath(), 'infrastructure/database/migrations')
      : path.join(process.resourcesPath, 'app.asar.unpacked', 'infrastructure/database/migrations'); // Exemplo se empacotado com asar e migrations fora

    // Alternativamente, para dev, se o main.ts está em src2/electron:
    const devMigrationsPath = path.join(app.getAppPath(), 'infrastructure/database/migrations');
    console.log(`[DB Main] Tentando aplicar migrações de: ${devMigrationsPath}`);
    // A ferramenta migrate do Drizzle ORM não é para ser usada programaticamente assim diretamente no BetterSQLite3.
    // As migrações são aplicadas via drizzle-kit CLI.
    // O que podemos fazer é garantir que o DB é criado se não existir, e o schema é aplicado.
    // A instanciação do `new Database(dbPath)` já cria o arquivo se não existir.
    // O schema é gerenciado pelo Drizzle através das migrações aplicadas via CLI.
    // Para garantir que as tabelas existam, as migrações devem ser executadas como parte do processo de build/setup.
    console.log("[DB Main] Banco de dados inicializado. As migrações devem ser aplicadas via 'npm run db:migrate'.");

  } catch (migrationError) {
    console.error("[DB Main] Falha ao aplicar migrações:", migrationError);
    // Considerar fechar o app ou notificar o usuário sobre o erro crítico.
  }


  createWindow();

  // Handlers IPC
  ipcMain.handle('queue:addJob', async (_event, jobData: NewJob) => {
    try {
      console.log('[IPC Main] queue:addJob - Recebido:', JSON.stringify(jobData, null, 2));
      const job = await queueService.addJob(jobData);
      console.log('[IPC Main] queue:addJob - Job Adicionado:', JSON.stringify(job, null, 2));
      return { success: true, job };
    } catch (error) {
      console.error('[IPC Main] queue:addJob - Erro:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('queue:getNextJob', async (_event, criteria?: { personaId?: string; excludedIds?: string[] }) => {
    try {
      console.log('[IPC Main] queue:getNextJob - Critérios:', criteria);
      const job = await queueService.getNextJob(criteria);
      console.log('[IPC Main] queue:getNextJob - Job Obtido:', job ? JSON.stringify(job, null, 2) : null);
      return { success: true, job };
    } catch (error) {
      console.error('[IPC Main] queue:getNextJob - Erro:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('queue:completeJob', async (_event, jobId: string, result: any) => {
    try {
      console.log(`[IPC Main] queue:completeJob - ID: ${jobId}, Resultado: ${JSON.stringify(result, null, 2)}`);
      const job = await queueService.completeJob(jobId, result);
      console.log('[IPC Main] queue:completeJob - Job Atualizado:', job ? JSON.stringify(job, null, 2) : null);
      return { success: true, job };
    } catch (error) {
      console.error('[IPC Main] queue:completeJob - Erro:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('queue:failJob', async (_event, jobId: string, reason: string) => {
    try {
      console.log(`[IPC Main] queue:failJob - ID: ${jobId}, Razão: ${reason}`);
      const job = await queueService.failJob(jobId, reason);
      console.log('[IPC Main] queue:failJob - Job Atualizado:', job ? JSON.stringify(job, null, 2) : null);
      return { success: true, job };
    } catch (error) {
      console.error('[IPC Main] queue:failJob - Erro:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
});
