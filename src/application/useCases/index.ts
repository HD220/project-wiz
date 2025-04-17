import { ContainerModule } from 'inversify';
import { GitUseCases } from './GitUseCases';
import { TYPES } from '../../shared/types/di';

const useCasesModule = new ContainerModule((bind: any) => {
  bind(TYPES.GitUseCases).to(GitUseCases);
});

export { useCasesModule };