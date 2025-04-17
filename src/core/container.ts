import 'reflect-metadata';
import { Container } from 'inversify';
import { IGitService } from '../domain/IGitService';
import { GitUseCases } from '../application/useCases/GitUseCases';
import { ElectronGitService } from '../infrastructure/ElectronGitService';
import { useCasesModule } from '../application/useCases';
import { gitConfig } from './config/git.config';
import { TYPES } from '../shared/types/di';

const container = new Container();

// Configuração padrão
container.load(useCasesModule);
container.load(gitConfig);
container.bind<GitUseCases>(TYPES.GitUseCases).toSelf();

export { container };