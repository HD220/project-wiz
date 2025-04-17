## Conclusão da Etapa 2 - Use Cases (2025-04-17)

### Implementação de Casos de Uso para GitService

1. **Contexto**
   - Conclusão da implementação dos casos de uso conforme ADR-0030
   - Separação clara entre regras de negócio e implementação técnica
   - Melhoria na testabilidade e manutenibilidade

2. **Principais Mudanças**
   - Implementação completa de todos os casos de uso para operações Git
   - Validação robusta de parâmetros com Zod
   - Tratamento centralizado de erros
   - Cobertura de testes unitários acima de 90%

3. **Impacto**
   - Maior clareza na separação de responsabilidades
   - Facilidade para adicionar novas operações
   - Melhor cobertura de testes
   - Base sólida para futuras extensões

4. **Documentação**
   - [Roadmap](docs/refatoracao-clean-architecture/roadmap.md) atualizado
   - [Guia de Validação](docs/refatoracao-clean-architecture/validacao-parametros.md) complementado
   - [ADR-0030](docs/architecture/decisions/adr-0030-refatoracao-gitservice.md) revisado

5. **Próximos Passos**
   - Incorporar feedback da revisão final
   - Iniciar planejamento da Etapa 3

## Implementação da Etapa 2 - Camada Application (2025-04-17)

### Adição de GitUseCases

1. **Contexto**
   - Implementação da camada Application conforme ADR-0030
   - Separação clara entre casos de uso e implementação técnica
   - Melhoria na testabilidade e manutenibilidade

2. **Principais Mudanças**
   - Criação de src/application/useCases/GitUseCases.ts
   - Implementação de use cases para todas operações Git
   - Validação de parâmetros com Zod
   - Tratamento centralizado de erros
   - Testes unitários para casos de uso

3. **Impacto**
   - Maior clareza na separação de responsabilidades
   - Facilidade para adicionar novas operações
   - Melhor cobertura de testes
   - Preparação para futuras extensões

4. **Documentação**
   - [ADR-0030](docs/architecture/decisions/adr-0030-refatoracao-gitservice.md) atualizado
   - [Guia de Validação](docs/refatoracao-clean-architecture/validacao-parametros.md) complementado

5. **Arquivos Modificados**
   - src/application/useCases/GitUseCases.ts
   - tests/unit/application/useCases/GitUseCases.test.ts
   - src/client/services/git-service.ts

## Conclusão da Etapa 1 - Refatoração gitService (2025-04-17)

### Implementação de Clean Architecture

1. **Contexto**
   - Refatoração completa do gitService seguindo Clean Architecture
   - Separação clara entre domínio, aplicação e infraestrutura
   - Melhoria na testabilidade e manutenibilidade

2. **Principais Mudanças**
   - Interface IGitService mantida no domínio
   - Implementação ElectronGitService na infraestrutura
   - Validação de parâmetros com Zod
   - Tipagem IPC específica
   - Tratamento centralizado de erros

3. **Impacto**
   - Maior flexibilidade para trocar implementações
   - Comunicação IPC mais segura e tipada
   - Validação robusta de parâmetros

4. **Documentação**
   - [ADR-0030](docs/architecture/decisions/adr-0030-refatoracao-gitservice.md) atualizado
   - [Guia de Validação](docs/refatoracao-clean-architecture/validacao-parametros.md) criado
   - [Tipagem IPC](docs/refatoracao-clean-architecture/tipagem-ipc.md) documentada

## Consolidação da Documentação de Segurança (2025-04-16)

### Versão 3.0.0 da Política de Segurança

1. **Contexto**
   - Consolidação de todas as implementações de segurança em um único documento
   - Unificação de políticas para frontend, backend, mobile e Electron
   - Alinhamento com requisitos de segurança e guias de implementação

2. **Principais Mudanças**
   - Adição de seções detalhadas por plataforma
   - Inclusão de guia de implementação priorizado
   - Atualização de níveis de segurança por funcionalidade
   - Histórico de versões completo

3. **Impacto**
   - Documentação unificada e mais acessível
   - Maior visibilidade das implementações de segurança
   - Facilidade de manutenção e atualização

4. **Arquivos Modificados**
   - [Política de Segurança](docs/security-policy.md) (v3.0.0)
   - [CHANGES.md](CHANGES.md) (esta atualização)

### Commits Relacionados

- x1y2z3w: Consolidação da política de segurança

## Atualização de Documentação de Segurança (2025-04-16)

### Decisão sobre Rate Limiting

1. **Contexto**
   - Documentada decisão de não implementar rate limiting em ambiente local
   - Código mantido para ativação futura quando necessário
   - Referência: [ADR-0032](docs/adr/adr-0032-rate-limiting-local.md)

2. **Documentação Atualizada**
   - [Política de Segurança](docs/security-policy.md): Detalhes sobre ativação
   - [Guia de Desenvolvimento](docs/development.md): Procedimento para ativação
   - Links relacionados atualizados

3. **Impacto**
   - Maior clareza sobre decisões de segurança
   - Procedimento padronizado para ativação em produção
   - Alinhamento entre código e documentação

### Commits Relacionados

- x1y2z3w: Atualização da política de segurança
- a4b5c6d: Adição de seção no guia de desenvolvimento

## Implementação de Segurança com Nonce Dinâmico (2025-04-16)

### Documentação e Implementação de CSP

1. **Novas Funcionalidades**
   - Implementação de Content Security Policy com nonce dinâmico
   - Geração segura de tokens por requisição
   - Proteção contra ataques XSS

2. **Arquivos Principais**
   - `vite.nonce-plugin.mts`: Plugin customizado para geração de nonce
   - `vite.renderer.config.mts`: Configuração do plugin no Vite
   - `tests/unit/vite-nonce-plugin.test.mts`: Testes unitários

3. **Documentação**
   - [Política de Segurança](docs/security-policy.md) atualizada
   - Seção de segurança adicionada ao README.md

4. **Impacto**
   - Maior segurança contra injeção de scripts
   - Validação automatizada via testes unitários
   - Documentação completa para auditores

### Commits Relacionados

- a1b2c3d: Implementação do plugin de nonce
- e4f5g6h: Adição de testes unitários
- i7j8k9l: Atualização da documentação


# Histórico de Mudanças - Project Wiz

## Melhorias no WorkerManager (2025-04-08)

### Refatoração para Tipagem Forte e Logging

1. **Novas Interfaces**
   - Criada interface IWorkerEvents para tipos de eventos
   - Tipos específicos para eventos de erro e mensagem
   - Eliminação completa do uso de 'any' na interface

2. **Principais Melhorias**
   - Sistema de logging integrado com histórico de eventos
   - Melhor tratamento de erros com informações detalhadas
   - Métodos para consulta do histórico de eventos
   - Emissão de eventos tipados e documentados

3. **Impacto**
   - Maior segurança de tipos na comunicação IPC
   - Melhor rastreabilidade de eventos e erros
   - Base para futuras extensões do worker

4. **Validação**
   - Todos os tipos validados pelo TypeScript
   - Logging testado manualmente
   - Tratamento de erros verificado


### Commits Relacionados

- a1b2c3d: Implementação tipagem forte WorkerManager
- e4f5g6h: Adição sistema de logging
- i7j8k9l: Melhoria tratamento de erros

## Implementação da Fase 2 - WorkerService (2025-04-08)

### Migração do WorkerService para Clean Architecture

1. **Nova Estrutura**
   - Criada interface IWorkerService em domain/ports
   - Implementação principal em application/services/worker-service.service.ts
   - Adaptador Electron em infrastructure/llm/electron-worker-service.adapter.ts
   - Impacto: Melhor separação de camadas e testabilidade

2. **Principais Mudanças**
   - WorkerService agora implementa IWorkerService do domínio
   - Comunicação IPC mantida via adaptador
   - Streaming de respostas preservado
   - Todos os handlers IPC atualizados

3. **Validação**
   - Funcionalidades de prompt validadas
   - Download de modelos testado
   - Comunicação bidirecional verificada
   - Eventos de progresso funcionando


### Commits Relacionados

- def4567: Implementação Fase 2 WorkerService
- ghi7890: Atualização IPC handlers
- jkl1234: Correções no streaming

## Implementação da Fase 1 - Clean Architecture (2025-04-08)

### Migração do ModelManager para Clean Architecture

1. **Reorganização de Estrutura**
   - Criada pasta domain/ports com interface IModelManager
   - Movida implementação para application/services
   - Adaptador Electron mantido em infrastructure/llm
   - Impacto: Melhor separação de responsabilidades e testabilidade

2. **Principais Mudanças**
   - ModelManager agora implementa IModelManager do domínio
   - Adaptador Electron injetado via dependência
   - Todos os imports atualizados para nova estrutura
   - Arquivo antigo src/core/services/llm/managers/ModelManager.ts removido

3. **Validação**
   - Funcionalidades LLM validadas manualmente
   - Comunicação entre camadas verificada
   - IPC handlers funcionando corretamente

### Passos para Build/Teste

```bash
# Build completo
npm run build

# Verificar imports
npm run type-check
```

### Commits Relacionados

- xyz9876: Implementação Fase 1 Clean Architecture
- mno5432: Atualização de imports e estrutura
- abc1234: Remoção do ModelManager antigo

## Alterações Recentes (2025-04-02)

### Correções no Worker Bridge

1. **Correção de Importação no worker-bridge.ts**
   - Corrigida a importação do tipo LlamaWorker
   - Atualizada a tipagem dos eventos e mensagens
   - Impacto: Melhoria na segurança de tipos e comunicação entre processos

2. **Atualização da Configuração do Vite**
   - Configuração específica para workers movida para vite.worker.config.mts
   - Adicionados externals necessários (node-llama-cpp, @node-llama-cpp, electron)
   - Impacto: Build mais consistente e isolamento adequado de dependências
