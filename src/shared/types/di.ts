import { interfaces } from 'inversify';

export const TYPES = {
  GitService: Symbol.for('IGitService'),
  GitUseCases: Symbol.for('GitUseCases')
};

export interface IGitService {
  cloneRepository(url: string, path: string): Promise<void>;
  pullRepository(path: string): Promise<void>;
  // Outros métodos do serviço Git
}

export interface IConfig {
  // Tipos para configuração
}

export interface ContainerModule {
  registry: interfaces.ContainerModuleCallBack;
}