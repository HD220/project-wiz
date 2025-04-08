import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { IWorkerService } from '../../domain/ports/iworker-service.port';
import { WorkerService } from '../../application/services/worker-service.service';

export class ElectronWorkerServiceAdapter implements IWorkerService {
  private workerService: WorkerService;
  private ipcChannel: string;

  constructor(ipcChannel: string = 'worker-service') {
    this.workerService = new WorkerService();
    this.ipcChannel = ipcChannel;
    this.setupIpcHandlers();
    this.setupEventForwarding();
  }

  private setupIpcHandlers() {
    ipcMain.handle(`${this.ipcChannel}:loadModel`, async (event: IpcMainInvokeEvent, options: any) => {
      await this.workerService.loadModel(options);
      return { success: true };
    });

    ipcMain.handle(`${this.ipcChannel}:unloadModel`, async () => {
      await this.workerService.unloadModel();
      return { success: true };
    });

    ipcMain.handle(`${this.ipcChannel}:createContext`, async (event: IpcMainInvokeEvent, options: any) => {
      await this.workerService.createContext(options);
      return { success: true };
    });

    ipcMain.handle(`${this.ipcChannel}:prompt`, async (event: IpcMainInvokeEvent, { prompt, options }: any) => {
      const response = await this.workerService.prompt(prompt, options);
      return { success: true, response };
    });

    ipcMain.handle(`${this.ipcChannel}:downloadModel`, async (event: IpcMainInvokeEvent, options: any) => {
      const modelPath = await this.workerService.downloadModel(options);
      return { success: true, modelPath };
    });
  }

  private setupEventForwarding() {
    this.workerService.on('response', (response: string) => {
      ipcMain.emit(`${this.ipcChannel}:response`, response);
    });

    this.workerService.on('error', (error: Error) => {
      ipcMain.emit(`${this.ipcChannel}:error`, error);
    });

    this.workerService.on('progress', (progress: number) => {
      ipcMain.emit(`${this.ipcChannel}:progress`, progress);
    });
  }

  async loadModel(options: any): Promise<void> {
    return this.workerService.loadModel(options);
  }

  async unloadModel(): Promise<void> {
    return this.workerService.unloadModel();
  }

  async createContext(options?: any): Promise<void> {
    return this.workerService.createContext(options);
  }

  async prompt(prompt: string, options?: any): Promise<string> {
    return this.workerService.prompt(prompt, options);
  }

  async downloadModel(options: any): Promise<string> {
    return this.workerService.downloadModel(options);
  }

  on(event: 'response' | 'error' | 'progress', listener: (...args: any[]) => void): void {
    this.workerService.on(event, listener);
  }
}