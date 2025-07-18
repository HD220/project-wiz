# 7. Desenvolvimento e Qualidade

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17  

---

## 🎯 Visão Geral

Este documento é um guia prático para desenvolvedores do Project Wiz. Ele consolida a configuração do ambiente, os padrões de código e a estratégia de testes para garantir um fluxo de trabalho produtivo e a alta qualidade do software, sempre no contexto da nossa arquitetura de domínios.

---

## 1. Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

-   **Node.js**: v20.10.0 ou superior.
-   **npm**: v10.0.0 ou superior.
-   **Git**: v2.40.0 ou superior.

### Setup Inicial

1.  **Clone e Instale**: `git clone ...` e `npm install`.
2.  **Configure o Ambiente**: Copie `.env.example` para `.env` e adicione suas chaves de API.
3.  **Prepare o Banco de Dados**: `npm run db:reset` (aplica migrações e adiciona dados de teste).
4.  **Inicie o Desenvolvimento**: `npm run dev`.

### Scripts Essenciais

-   `npm run dev`: Inicia o ambiente de desenvolvimento com hot-reload.
-   `npm run quality:check`: Roda todas as verificações de qualidade (lint, types, format, tests).
-   `npm run test`: Executa os testes unitários e de integração.
-   `npm run db:studio`: Abre o Drizzle Studio para visualizar o banco de dados.

---

## 2. Padrões de Código e Convenções

Nossos padrões visam a clareza e a consistência, alinhados com a arquitetura de domínios.

### Convenções de Nomenclatura

-   **Arquivos e Diretórios**: `kebab-case` (ex: `user-service.ts`).
-   **Componentes React**: `PascalCase` para a função/classe (ex: `ProjectCard`), mas `kebab-case` para o nome do arquivo (`project-card.tsx`).
-   **Backend (Domain-Driven)**: A estrutura de pastas define o domínio. Ex: `src/main/project/project.service.ts`.
-   **Frontend (Features)**: A estrutura espelha o backend. Ex: `src/renderer/features/project/hooks/use-projects.ts`.
-   **Variáveis de Schema Drizzle**: `camelCase` com sufixo `Table` (ex: `projectsTable`, `usersTable`).

### Checklist de Qualidade Antes do Commit

-   [ ] O código está formatado (`npm run format`)?
-   [ ] Não há erros de lint ou tipo (`npm run lint:check && npm run type-check`)?
-   [ ] Novos testes foram adicionados e todos estão passando (`npm run test`)?
-   [ ] O código segue a estrutura de domínios e as convenções de nomenclatura?

---

## 3. Estratégia de Testes

Nossa estratégia de testes pragmática garante a qualidade em todas as camadas da arquitetura.

### Pirâmide de Testes

-   **Unit Tests (70%)**: Foco principal. Testam a lógica de negócio dentro de um `service` de um agregado ou a lógica de um componente React de uma `feature`.
-   **Integration Tests (20%)**: Verificam a interação entre diferentes partes do sistema, como a comunicação IPC entre frontend e backend ou a interação de um serviço com o banco de dados.
-   **End-to-End (E2E) Tests (10%)**: Simulam fluxos de usuário completos para os cenários mais críticos.

### Onde os Testes Ficam?

Os testes são colocados em um diretório `tests/` na raiz, espelhando a estrutura de `src/` para facilitar a localização.

```
tests/
├── main/
│   └── project/
│       └── project.service.test.ts
└── renderer/
    └── features/
        └── project/
            └── components/
                └── project-card.test.tsx
```

### Exemplo de Teste de Integração (Backend)

Este teste valida a interação entre o `ProjectService` e o `ChannelService`.

```typescript
// tests/main/project/project-service.integration.test.ts
import { ProjectService } from '@/main/project/project.service';
import { ChannelService } from '@/main/project/channels/channel.service';

describe('ProjectService Integration', () => {
  it('deve criar canais padrão ao criar um novo projeto', async () => {
    // Arrange: Mock do ChannelService
    const createDefaultSpy = vi.spyOn(ChannelService, 'createDefaultChannels').mockResolvedValue();

    // Act
    const project = await ProjectService.create({ name: 'Projeto de Teste' });

    // Assert
    // Verifica se o serviço de outro agregado foi chamado corretamente
    expect(createDefaultSpy).toHaveBeenCalledWith(project.id);
  });
});
```
