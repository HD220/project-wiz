# Plano de Implementação para Etapa 3 - Refatoração dos Pontos de Injeção

**Status**: Planejado  
**Última Atualização**: 2025-04-17  
**Responsável**: Equipe de Arquitetura  
**Versão**: 1.0.0-draft  

## Objetivo
Padronizar a injeção de dependências e centralizar a configuração seguindo os princípios de Clean Architecture.

## Estrutura Proposta

### 1. Container de DI (src/core/container.ts)
```typescript
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
```

### 2. Padronização de Interfaces
- Manter IGitService como contrato principal
- Criar interfaces específicas para casos de uso complexos

### 3. Centralização de Configuração (src/core/config/git.config.ts)
```typescript
import { interfaces } from 'inversify';

export const gitConfig: interfaces.ContainerModule = new interfaces.ContainerModule((bind) => {
  // Configurações específicas do módulo Git
});
```

### 4. Documentação de Padrões
- Guia de implementação
- Exemplos de uso
- Boas práticas

## Módulos Afetados
- src/application/useCases/GitUseCases.ts
- src/infrastructure/ElectronGitService.ts
- Todos os pontos de consumo do serviço

## Roadmap Detalhado

### Semana 1 (20/04 - 24/04)
- Implementar container DI básico
- Atualizar casos de uso para usar DI
- Criar documentação inicial

### Semana 2 (27/04 - 01/05)
- Refatorar pontos de injeção existentes
- Implementar configuração centralizada
- Atualizar testes

### Semana 3 (04/05 - 08/05)
- Validar implementação
- Atualizar guias de desenvolvimento
- Treinamento da equipe

## Recomendações Técnicas
- Usar InversifyJS para DI
- Manter validação no adaptador (única fonte de verdade)
- Criar interface de configuração para testes
- Documentar exemplos de mock para testes

## Histórico de Versões
| Versão | Data       | Descrição               |
|--------|------------|-------------------------|
| 1.0.0  | 2025-04-17 | Versão inicial (draft)  |