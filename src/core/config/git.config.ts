import { ContainerModule } from 'inversify';
import { TYPES } from '../../shared/types/di';
import { IGitService } from '../../domain/IGitService';
import { ElectronGitService } from '../../infrastructure/ElectronGitService';

export const gitConfig = new ContainerModule((bind: any) => {
  bind(TYPES.GitService).to(ElectronGitService);
});