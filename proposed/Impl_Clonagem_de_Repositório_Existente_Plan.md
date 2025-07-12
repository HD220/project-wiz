# Plano de Implementação Detalhado: Caso de Uso 4 - Clonagem de Repositório Existente

## 1. Visão Geral do Caso de Uso

Este documento detalha o plano de implementação para o caso de uso "Clonagem de Repositório Existente", conforme descrito em `proposed/Detailed_Use_Cases.md`. O objetivo é permitir que o usuário (PO) clone um repositório Git remoto existente para um diretório local, criando um novo projeto no sistema a partir desse repositório.

## 2. Análise da Base de Código Existente e Identificação de Gaps

A análise da base de código revelou que a funcionalidade central de clonagem Git já está implementada e integrada ao fluxo de criação de projetos. O principal foco aqui será refinar a experiência do usuário e o tratamento de erros para este cenário específico.

### Componentes Existentes:

- **Módulo `git-integration` (`src/main/modules/git-integration`):**
  - **Comandos e Handlers:** `CloneRepositoryCommand` e `CloneRepositoryCommandHandler` já existem e encapsulam a lógica de execução do comando `git clone`.
  - **Serviço:** `GitService` fornece o método `clone(repoUrl: string, localPath: string)` que executa o comando Git real.
  - **IPC Handlers:** `GIT_INTEGRATION_CLONE` já está registrado para comunicação entre o processo principal e o de renderização.
- **Módulo `project-management` (`src/main/modules/project-management`):**
  - **`CreateProjectCommandHandler`:** Este handler já possui a lógica para chamar `gitIntegrationService.cloneRepository` se uma `remoteUrl` for fornecida durante a criação de um projeto. Isso significa que a integração backend para clonagem dentro do fluxo de criação de projeto já está estabelecida.
  - **Entidade `Project`:** A entidade `Project` e seu esquema de persistência (`DrizzleProjectRepository`) já incluem o campo `remoteUrl`, o que é fundamental para armazenar a origem do repositório clonado.
- **UI/UX (Frontend - `src/renderer`):**
  - Os componentes `CreateProjectModal` e `CreateProjectForm` (cujas modificações foram detalhadas no plano do Caso de Uso 1) já foram estendidos para incluir um campo `remoteUrl` e uma opção `gitOption` (`'new'` ou `'clone'`). Isso significa que a interface para inserir a URL de clonagem já existe.

### Gaps Identificados:

1.  **Ponto de Entrada Dedicado na UI (Opcional, mas Recomendado):** Embora a funcionalidade de clonagem esteja integrada ao modal de criação de projeto, o caso de uso sugere uma opção explícita "Clonar Repositório". Isso pode ser um botão separado na interface principal que abre o modal de criação de projeto com a opção de clonagem pré-selecionada.
2.  **Tratamento de Erros e Feedback ao Usuário (Frontend):** O feedback atual pode ser genérico. É crucial fornecer mensagens de erro mais específicas para cenários de clonagem, como:
    - URL de repositório inválida.
    - Erros de autenticação (credenciais, permissões).
    - Problemas de rede.
    - Diretório de destino não vazio ou já existente.
3.  **Feedback de Progresso durante a Clonagem:** Clonar repositórios grandes pode levar tempo. Não há um mecanismo explícito para fornecer feedback de progresso em tempo real (e.g., porcentagem, arquivos sendo baixados) para o usuário na UI.
4.  **Validação de URL (Frontend e Backend):** Embora o campo `remoteUrl` exista, a validação da URL (formato, acessibilidade) precisa ser robusta tanto no frontend (para feedback imediato) quanto no backend (para segurança e integridade).

## 3. Plano de Implementação Detalhado

### 3.1. Modificações no Frontend (`src/renderer`)

**Objetivo:** Aprimorar a experiência do usuário para a clonagem de repositórios, fornecendo um ponto de entrada claro, validação robusta e feedback de progresso.

**Arquivos a Modificar:**

- `src/renderer/features/project-management/components/create-project-modal.tsx`
- `src/renderer/features/project-management/components/create-project-form.tsx`
- `src/renderer/app/__root.tsx` ou componente de layout principal (para o ponto de entrada)
- `src/shared/ipc-types/ipc-channels.ts` (para um novo canal de progresso, se implementado)
- `src/shared/ipc-types/ipc-payloads.ts` (para o payload do progresso, se implementado)

**Passos:**

1.  **Ponto de Entrada "Clonar Repositório" (Opcional):**
    - Adicionar um botão ou item de menu na interface principal (e.g., na `AppSidebar` ou em um menu de "Arquivo") com o texto "Clonar Repositório".
    - Ao clicar, este botão deve abrir o `CreateProjectModal` e, idealmente, pré-selecionar a opção `gitOption` como `'clone'` e focar no campo `remoteUrl`.

    ```typescript
    // Exemplo: src/renderer/components/layout/project-sidebar.tsx
    // ... imports ...
    import { CreateProjectModal } from "@/renderer/features/project-management/components/create-project-modal";

    export function AppSidebar() {
      // ... código existente ...

      return (
        // ... JSX existente ...
        <div className="mt-auto p-4">
          <CreateProjectModal initialGitOption="clone"> {/* Novo prop */}
            <Button className="w-full">Clonar Repositório</Button>
          </CreateProjectModal>
        </div>
        // ...
      );
    }

    // src/renderer/features/project-management/components/create-project-modal.tsx
    // ... imports ...
    interface CreateProjectModalProps {
      onProjectCreated?: () => void;
      initialGitOption?: 'new' | 'clone'; // Novo prop
      children?: React.ReactNode; // Para o botão de trigger
    }

    function CreateProjectModal({ onProjectCreated, initialGitOption = 'new', children }: CreateProjectModalProps) {
      // ... estados existentes ...
      const [gitOption, setGitOption] = useState<'new' | 'clone'>(initialGitOption); // Usar prop inicial

      // ... restante do código ...

      return (
        <Dialog>
          <DialogTrigger asChild>{children || <Button>Criar Novo Projeto</Button>}</DialogTrigger>
          {/* ... restante do modal ... */}
          <CreateProjectForm
            // ... props existentes ...
            gitOption={gitOption}
            setGitOption={setGitOption}
          />
          {/* ... */}
        </Dialog>
      );
    }
    ```

2.  **Validação de URL no Frontend:**
    - Adicionar validação de formato de URL ao campo `remoteUrl` no `CreateProjectForm` usando bibliotecas como `zod` ou regex simples. Fornecer feedback visual imediato ao usuário.

    ```typescript
    // src/renderer/features/project-management/components/create-project-form.tsx
    // ...
    const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
      // ... props ...
    }) => {
      // ...
      const isValidUrl = (url: string) => {
        try {
          new URL(url); // Tenta criar uma URL, lança erro se inválida
          return true;
        } catch (e) {
          return false;
        }
      };

      return (
        <form className="grid gap-4 py-4">
          {/* ... campos existentes ... */}

          {gitOption === 'clone' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remoteUrl" className="text-right">
                URL do Repositório
              </Label>
              <Input
                id="remoteUrl"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://github.com/user/repo.git"
              />
              {!isValidUrl(remoteUrl) && remoteUrl.length > 0 && (
                <p className="col-span-4 text-right text-red-500 text-sm">URL inválida.</p>
              )}
            </div>
          )}
          {/* ... */}
        </form>
      );
    };
    ```

3.  **Feedback de Progresso (Frontend):**
    - Implementar um mecanismo para exibir o progresso da clonagem. Isso pode ser um `ProgressBar` ou uma mensagem de status detalhada dentro do `CreateProjectModal`.
    - Isso exigirá um novo canal IPC para o backend enviar atualizações de progresso.

    ```typescript
    // src/shared/ipc-types/ipc-channels.ts
    export enum IpcChannel {
      // ... existentes ...
      GIT_INTEGRATION_CLONE_PROGRESS = "git-integration:clone-progress",
    }

    // src/shared/ipc-types/ipc-payloads.ts
    export interface IpcGitIntegrationCloneProgressPayload {
      progress: number; // 0-100
      message: string; // Mensagem de status (e.g., "Recebendo objetos...")
    }

    // src/renderer/features/project-management/components/create-project-modal.tsx
    // ... imports ...
    import { ProgressBar } from "@/ui/progress-bar"; // Exemplo

    function CreateProjectModal({ onProjectCreated, initialGitOption = 'new', children }: CreateProjectModalProps) {
      // ... estados existentes ...
      const [cloneProgress, setCloneProgress] = useState(0);
      const [cloneMessage, setCloneMessage] = useState("");

      // Hook para escutar o progresso da clonagem
      useIpcQuery<IpcGitIntegrationCloneProgressPayload>({
        channel: IpcChannel.GIT_INTEGRATION_CLONE_PROGRESS,
        onSuccess: (payload) => {
          setCloneProgress(payload.progress);
          setCloneMessage(payload.message);
        },
        // Não há payload para queries de real-time events
      });

      // ... handleSubmit ...

      return (
        <Dialog>
          {/* ... */}
          <DialogContent className="sm:max-w-[425px]">
            {/* ... */}
            {isPending && gitOption === 'clone' && (
              <div className="mt-4">
                <ProgressBar value={cloneProgress} className="w-full" />
                <p className="text-center text-sm mt-2">{cloneMessage}</p>
              </div>
            )}
            {/* ... */}
          </DialogContent>
        </Dialog>
      );
    }
    ```

### 3.2. Modificações no Backend (`src/main`)

**Objetivo:** Aprimorar o tratamento de erros e emitir eventos de progresso durante a clonagem.

**Arquivos a Modificar:**

- `src/main/modules/git-integration/domain/git.service.ts`
- `src/main/modules/git-integration/application/commands/clone-repository.command.ts` (se necessário, para tratamento de erros mais específico)
- `src/main/kernel/real-time-events.service.ts` (para emitir eventos de progresso)

**Passos:**

1.  **Aprimorar `GitService.clone` para Emitir Progresso:**
    - O método `clone` no `GitService` precisará ser modificado para capturar a saída do `git clone` (que inclui mensagens de progresso) e emitir eventos via `RealTimeEventsService`.
    - Isso pode ser feito executando o comando `git clone` com a opção `--progress` e parseando a saída do stderr.

    ```typescript
    // src/main/modules/git-integration/domain/git.service.ts
    // ... imports existentes ...
    import { RealTimeEventsService } from "@/main/kernel/real-time-events.service"; // Novo import
    import { IpcChannel } from "@/shared/ipc-types/ipc-channels"; // Novo import

    export class GitService implements IGitService {
      constructor(
        private readonly realTimeEventsService: RealTimeEventsService,
      ) {} // Injetar

      async clone(repoUrl: string, localPath: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
          const command = `git clone --progress ${repoUrl} ${localPath}`;
          logger.info(`Executing git clone: ${command}`);

          try {
            const child = execaCommand(command, { cwd: process.cwd() }); // Executar no diretório raiz da aplicação

            child.stderr?.on("data", (data) => {
              const output = data.toString();
              // Exemplo de parsing de progresso (pode variar dependendo da versão do Git)
              const progressMatch = output.match(/Receiving objects: (\d+)%/);
              if (progressMatch && progressMatch[1]) {
                const progress = parseInt(progressMatch[1], 10);
                this.realTimeEventsService.emit(
                  IpcChannel.GIT_INTEGRATION_CLONE_PROGRESS,
                  { progress, message: output.trim() },
                );
              }
              logger.debug(`Git clone stderr: ${output.trim()}`);
            });

            const { stdout, stderr } = await child;

            if (stderr) {
              logger.warn(`Git clone stderr: ${stderr}`);
            }

            logger.info(`Git clone stdout: ${stdout}`);
            this.realTimeEventsService.emit(
              IpcChannel.GIT_INTEGRATION_CLONE_PROGRESS,
              { progress: 100, message: "Clonagem concluída!" },
            );
            resolve(stdout);
          } catch (error) {
            logger.error(`Git clone failed: ${(error as Error).message}`);
            this.realTimeEventsService.emit(
              IpcChannel.GIT_INTEGRATION_CLONE_PROGRESS,
              {
                progress: 0,
                message: `Erro na clonagem: ${(error as Error).message}`,
              },
            );
            reject(
              new ApplicationError(
                `Failed to clone repository: ${(error as Error).message}`,
              ),
            );
          }
        });
      }
      // ... outros métodos ...
    }
    ```

2.  **Tratamento de Erros Específicos (Backend):**
    - No `CreateProjectCommandHandler` e no `CloneRepositoryCommandHandler`, capturar exceções específicas do `GitService` e re-lançar `ApplicationError` com mensagens mais descritivas para o frontend.
    - Por exemplo, se `git clone` falhar devido a um diretório não vazio, o `GitService` pode lançar um erro específico que o handler pode traduzir para uma mensagem amigável.

### 3.3. Testes e Verificação

**Objetivo:** Garantir que a clonagem de repositórios funcione corretamente, com feedback adequado e tratamento de erros.

**Passos:**

1.  **Testes Unitários:**
    - Testar `GitService.clone` para garantir que emite eventos de progresso e lida com diferentes cenários de erro (URL inválida, diretório existente).
    - Testar `CreateProjectCommandHandler` com `gitOption: 'clone'` para verificar o fluxo de clonagem e tratamento de erros.

2.  **Testes de Integração (Manual/E2E):**
    - Iniciar a aplicação.
    - Clicar no botão "Clonar Repositório" (se implementado).
    - Inserir uma URL de repositório Git pública válida (e.g., um repositório pequeno para teste).
    - Observar o feedback de progresso na UI.
    - Verificar se o projeto é criado e aparece na lista de projetos.
    - Tentar clonar um repositório com uma URL inválida e verificar a mensagem de erro.
    - Tentar clonar um repositório para um diretório local que já existe e não está vazio, e verificar a mensagem de erro.
    - (Opcional) Testar com um repositório que requer autenticação para verificar o fluxo de erro.

## 4. Considerações Adicionais

- **Autenticação Git:** O caso de uso não especifica como lidar com repositórios privados que exigem autenticação. Isso é um gap significativo para futuras iterações. Pode envolver a integração com gerenciadores de credenciais Git ou a solicitação de tokens/usuário/senha ao usuário.
- **Tamanho do Repositório:** Para repositórios muito grandes, o processo de clonagem pode ser demorado e consumir muitos recursos. Considerar otimizações ou feedback mais granular.
- **Cancelamento da Clonagem:** Não há uma opção para cancelar uma operação de clonagem em andamento. Isso pode ser uma melhoria futura.
- **Reuso de Código:** O `CreateProjectCommandHandler` já utiliza o `GitIntegrationService`. Garantir que as melhorias no `GitService` (progresso, erros) sejam propagadas corretamente para o `CreateProjectCommandHandler`.

Este plano detalha as modificações necessárias para implementar o caso de uso "Clonagem de Repositório Existente", cobrindo tanto o frontend quanto o backend, e incluindo considerações sobre testes e boas práticas.
