# ADR-0030: Refatoração gitService para Clean Architecture

## Status

- ✅ **Aceito** (17/04/2025)

> **Importante:**
> - Toda nova ADR deve começar com status **Proposto**.
> - Após revisão, atualizar para **Aceito**, **Rejeitado** ou **Superseded**.
> - Se substituída, referencie explicitamente a nova ADR.
> - Nunca excluir ou sobrescrever ADRs antigas.
> - Consulte a [ADR-0017-Governança do Processo de ADRs](../../adr/ADR-0017-Governanca-Processo-ADRs.md) para detalhes completos.

---

## Contexto

A estrutura atual do gitService já possui elementos de Clean Architecture (interface IGitService), mas apresenta oportunidades de melhoria:

1. Acoplamento com a implementação do Electron
2. Falta de camada de aplicação para casos de uso
3. Dificuldades na testabilidade

Forças influenciadoras:
- Necessidade de maior flexibilidade para trocar implementações
- Requisito de melhor testabilidade
- Preparação para futuras integrações (ex: Git CLI)

---

## Decisão

Refatorar o gitService seguindo os princípios de Clean Architecture com:

1. **Camadas definidas:**
   - Domain: Manter IGitService e tipos compartilhados
   - Application: Adicionar GitUseCases (ex: SyncRepositoryUseCase)
   - Infrastructure:
     - ElectronGitAdapter (implementa IGitService)
     - MockGitAdapter (para testes)

2. **Padrões aplicados:**
   - Dependency Injection
   - Ports & Adapters
   - Single Responsibility

3. **Ordem de implementação:**
   - Criar adaptador abstrato para Electron
   - Implementar camada de aplicação
   - Atualizar pontos de injeção
   - Refatorar testes

---

## Implementação

A implementação final incluiu:

1. **Validação com Zod**:
   - Todos os parâmetros são validados usando esquemas Zod
   - Mensagens de erro específicas para cada campo
   - Validação centralizada no adaptador ElectronGitService

2. **Tipagem IPC**:
   - Canais IPC específicos para cada operação Git
   - Tipos de resposta padronizados (IpcGitResponse<T>)
   - Esquemas de validação compartilhados entre main/renderer

3. **Tratamento de erros**:
   - Centralizado no método handleIpcError
   - Mensagens de erro consistentes
   - Preservação do stack trace original

## Consequências

**Positivas:**
- Maior flexibilidade para trocar implementações
- Testabilidade aprimorada
- Preparação para futuras integrações (ex: Git CLI)
- Validação robusta de parâmetros
- Comunicação IPC tipada e segura

**Desafios:**
- Necessidade de atualizar testes existentes
- Ajustes nos hooks que consomem o serviço
- Curva de aprendizado para a equipe
- Overhead inicial de configuração Zod

## Lições Aprendidas

1. **Validação**:
   - Zod provou ser eficaz para validação de parâmetros
   - Esquemas compartilhados garantem consistência

2. **Tipagem**:
   - Tipagem IPC específica melhorou segurança e autocomplete

3. **Erros**:
   - Tratamento centralizado simplificou o código
   - Mensagens de erro mais claras para desenvolvedores

---

## Alternativas Consideradas

- **Manter estrutura atual** — Rejeitado por não resolver problemas de acoplamento e testabilidade
- **Refatoração parcial** — Rejeitado por não trazer todos os benefícios da abordagem completa

---

## Links Relacionados

- [Documentação Clean Architecture](../../docs/architecture-overview.md)
- [IGitService atual](../../src/core/services/git/git.service.ts)