# Plano de Implementação Detalhado: Caso de Uso 1 - Criação de um Novo Projeto

## 1. Visão Geral do Caso de Uso

Este documento detalha o plano de implementação para o caso de uso "Criação de um Novo Projeto", conforme descrito em `proposed/Detailed_Use_Cases.md`. O objetivo é permitir que o usuário (PO) crie um novo projeto no sistema, que inclui a criação de um diretório local, inicialização de um repositório Git (ou clonagem de um remoto) e o estabelecimento de um canal de comunicação padrão.

## 2. Análise da Base de Código Existente e Identificação de Gaps

A análise da base de código revelou que grande parte da infraestrutura necessária para este caso de uso já está presente.

### Componentes Existentes:

- **Módulo `project-management` (`src/main/modules/project-management`):**
  - **Comandos e Handlers:** `CreateProjectCommand`, `CreateProjectCommandHandler`, `ListProjectsQuery`, `ListProjectsQueryHandler`, `RemoveProjectCommand`, `RemoveProjectCommandHandler`.
  - **Entidades e Repositórios:** `Project` entity, `IProjectRepository`, `DrizzleProjectRepository` (para persistência no banco de dados).
  - **Serviços:** `FilesystemService` (para operações de diretório), `GitIntegrationService` (para operações Git).
  - **IPC Handlers:** `PROJECT_CREATE`, `PROJECT_LIST`, `PROJECT_REMOVE` já estão configurados para comunicação entre o processo principal (main) e o processo de renderização (renderer).
- **Esquema do Banco de Dados (`src/main/modules/project-management/persistence/schema.ts`):**
  - A tabela `projects` já possui campos para `name`, `description`, `localPath`, `remoteUrl`, `createdAt`, `updatedAt`. Isso é excelente, pois não precisamos modificar o esquema do banco de dados para acomodar os novos requisitos.
- **UI/UX (Frontend - `src/renderer`):**
  - Componentes como `AppSidebar`, `CreateProjectModal` e `CreateProjectForm` já existem, indicando uma estrutura básica para a interface de criação e listagem de projetos.

### Gaps Identificados:

1.  **UI/UX - `CreateProjectForm`:** O formulário atual (`features/project-management/components/create-project-form.tsx`) aceita apenas o nome do projeto. Para atender ao caso de uso, ele precisa ser estendido para incluir:
    - Um campo opcional para a **descrição do projeto**.
    - Um campo opcional para a **URL de um repositório remoto** (para o caso de clonagem).
    - Lógica para alternar entre "criar novo repositório Git" e "clonar repositório existente" na UI, possivelmente com um `RadioGroup` ou `Switch`.
2.  **Backend - `CreateProjectCommand`:** O payload do comando (`src/main/modules/project-management/application/commands/create-project.command.ts`) atualmente só contém o `name`. Ele precisa ser atualizado para incluir `description` (opcional) e `remoteUrl` (opcional). Além disso, um novo campo `gitOption` (e.g., `'new'` ou `'clone'`) será necessário para indicar a ação Git desejada.
3.  **Backend - `CreateProjectCommandHandler`:** O handler (`src/main/modules/project-management/application/commands/create-project.handler.ts`) já possui a lógica para `git init` e `git clone`. No entanto, ele precisa ser adaptado para:
    - Receber os novos campos (`description`, `remoteUrl`, `gitOption`) do `CreateProjectCommand`.
    - Utilizar `remoteUrl` corretamente quando `gitOption` for `'clone'`.
    - Garantir que a lógica de criação de diretório e inicialização/clonagem Git seja condicional ao `gitOption`.
4.  **Criação de Canal de Comunicação Padrão:** O caso de uso especifica "O sistema cria um canal de comunicação padrão para o projeto (ex: `#general`)". Não há lógica explícita para isso no `CreateProjectCommandHandler`. O módulo `communication` (`src/main/modules/communication`) deve ser utilizado para criar este canal.

## 3. Plano de Implementação Detalhado

### 3.1. Modificações no Frontend (`src/renderer`)

**Objetivo:** Estender a interface de criação de projeto para incluir descrição e opção de clonagem/inicialização Git.

**Arquivos a Modificar:**

- `src/renderer/features/project-management/components/create-project-form.tsx`
- `src/renderer/features/project-management/components/create-project-modal.tsx`
- `src/shared/ipc-types/ipc-payloads.ts` (para o tipo `IpcProjectCreatePayload`)

**Passos:**

1.  **Atualizar `IpcProjectCreatePayload`:**
    - Adicionar `description?: string;` e `remoteUrl?: string;` e `gitOption: 'new' | 'clone';` ao tipo `IpcProjectCreatePayload` em `src/shared/ipc-types/ipc-payloads.ts`.

    ```typescript
    // src/shared/ipc-types/ipc-payloads.ts
    export interface IpcProjectCreatePayload {
      name: string;
      description?: string; // Novo campo
      remoteUrl?: string; // Novo campo
      gitOption: "new" | "clone"; // Novo campo
    }
    ```

2.  **Modificar `CreateProjectForm`:**
    - Adicionar campos de input para `description` e `remoteUrl`.
    - Adicionar um componente para selecionar a opção Git (e.g., `RadioGroup` ou `Switch` do Shadcn UI) para `gitOption`.
    - A visibilidade do campo `remoteUrl` deve ser condicional à seleção de `gitOption` como `'clone'`.
    - Atualizar as props do componente para aceitar e gerenciar os novos estados.

    ```typescript
    // src/renderer/features/project-management/components/create-project-form.tsx
    // ... imports ...
    import { RadioGroup, RadioGroupItem } from "@/ui/radio-group"; // Exemplo de import
    import { Switch } from "@/ui/switch"; // Alternativa ao RadioGroup

    interface CreateProjectFormProps {
      projectName: string;
      setProjectName: (name: string) => void;
      projectDescription: string; // Novo
      setProjectDescription: (description: string) => void; // Novo
      remoteUrl: string; // Novo
      setRemoteUrl: (url: string) => void; // Novo
      gitOption: 'new' | 'clone'; // Novo
      setGitOption: (option: 'new' | 'clone') => void; // Novo
      // ... outras props ...
    }

    const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
      projectName,
      setProjectName,
      projectDescription, // Novo
      setProjectDescription, // Novo
      remoteUrl, // Novo
      setRemoteUrl, // Novo
      gitOption, // Novo
      setGitOption, // Novo
      // ...
    }) => {
      return (
        <form className="grid gap-4 py-4">
          {/* Campo Nome do Projeto (existente) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectName" className="text-right">
              Nome do Projeto
            </Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Novo Campo: Descrição do Projeto */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="projectDescription" className="text-right">
              Descrição (Opcional)
            </Label>
            <Textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="col-span-3"
              placeholder="Uma breve descrição do seu projeto..."
            />
          </div>

          {/* Novo Campo: Opção Git */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Repositório Git
            </Label>
            <RadioGroup
              defaultValue="new"
              value={gitOption}
              onValueChange={(value: 'new' | 'clone') => setGitOption(value)}
              className="flex items-center space-x-4 col-span-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="git-new" />
                <Label htmlFor="git-new">Criar novo repositório</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="clone" id="git-clone" />
                <Label htmlFor="git-clone">Clonar repositório existente</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Novo Campo: URL do Repositório Remoto (condicional) */}
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
            </div>
          )}

          {/* Botão de Criação (existente) */}
          {/* ... */}
        </form>
      );
    };
    ```

3.  **Modificar `CreateProjectModal`:**
    - Adicionar estados para `projectDescription`, `remoteUrl` e `gitOption`.
    - Passar esses estados e seus setters para o `CreateProjectForm`.
    - Atualizar a chamada `createProject` para incluir os novos dados no payload.
    - Adicionar validação básica para `remoteUrl` se `gitOption` for `'clone'`.

    ```typescript
    // src/renderer/features/project-management/components/create-project-modal.tsx
    // ... imports ...
    import { useState } from "react"; // Certifique-se de que useState está importado

    function CreateProjectModal({ onProjectCreated }: CreateProjectModalProps) {
      const [projectName, setProjectName] = useState("");
      const [projectDescription, setProjectDescription] = useState(""); // Novo estado
      const [remoteUrl, setRemoteUrl] = useState(""); // Novo estado
      const [gitOption, setGitOption] = useState<'new' | 'clone'>('new'); // Novo estado

      const { mutate: createProject, isPending, error } = useIpcMutation<IProject, Error, IpcProjectCreatePayload>({
        channel: IpcChannel.PROJECT_CREATE,
        onSuccess: () => {
          setProjectName("");
          setProjectDescription(""); // Resetar
          setRemoteUrl(""); // Resetar
          setGitOption('new'); // Resetar
          onProjectCreated?.();
        },
        onError: (err) => {
          console.error("Failed to create project:", err);
          alert(`Erro ao criar projeto: ${err.message}`); // Feedback ao usuário
        },
      });

      const handleSubmit = () => {
        if (!projectName.trim()) {
          alert("O nome do projeto não pode ser vazio.");
          return;
        }
        if (gitOption === 'clone' && !remoteUrl.trim()) {
          alert("A URL do repositório remoto é obrigatória para clonagem.");
          return;
        }

        createProject({
          name: projectName,
          description: projectDescription, // Passar novo campo
          remoteUrl: gitOption === 'clone' ? remoteUrl : undefined, // Passar condicionalmente
          gitOption: gitOption, // Passar novo campo
        });
      };

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Criar Novo Projeto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
              <DialogDescription>
                Insira os detalhes para o seu novo projeto.
              </DialogDescription>
            </DialogHeader>
            <CreateProjectForm
              projectName={projectName}
              setProjectName={setProjectName}
              projectDescription={projectDescription} // Passar prop
              setProjectDescription={setProjectDescription} // Passar prop
              remoteUrl={remoteUrl} // Passar prop
              setRemoteUrl={setRemoteUrl} // Passar prop
              gitOption={gitOption} // Passar prop
              setGitOption={setGitOption} // Passar prop
            />
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Criando..." : "Criar Projeto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    ```

### 3.2. Modificações no Backend (`src/main`)

**Objetivo:** Atualizar o comando de criação de projeto e seu handler para processar os novos dados e criar o canal de comunicação padrão.

**Arquivos a Modificar:**

- `src/main/modules/project-management/application/commands/create-project.command.ts`
- `src/main/modules/project-management/application/commands/create-project.handler.ts`
- `src/main/modules/project-management/domain/project.entity.ts` (se necessário, para refletir os novos campos no construtor)
- `src/main/modules/communication/application/commands/create-channel.command.ts` (se não existir, criar)
- `src/main/modules/communication/application/commands/create-channel.handler.ts` (se não existir, criar)
- `src/main/modules/communication/index.ts` (para registrar o novo comando/handler)

**Passos:**

1.  **Atualizar `CreateProjectCommand`:**
    - Adicionar `description?: string;`, `remoteUrl?: string;` e `gitOption: 'new' | 'clone';` ao payload do comando.

    ```typescript
    // src/main/modules/project-management/application/commands/create-project.command.ts
    // ... imports ...

    export interface ICreateProjectCommandPayload {
      name: string;
      description?: string; // Novo campo
      remoteUrl?: string; // Novo campo
      gitOption: "new" | "clone"; // Novo campo
    }

    export class CreateProjectCommand
      implements ICommand<ICreateProjectCommandPayload>
    {
      readonly type = "CreateProjectCommand";
      constructor(public payload: ICreateProjectCommandPayload) {}
    }
    ```

2.  **Modificar `CreateProjectCommandHandler`:**
    - Injetar o `CqrsDispatcher` para poder despachar o comando de criação de canal.
    - Atualizar o método `handle` para desestruturar os novos campos do `command.payload`.
    - Ajustar a lógica de inicialização/clonagem Git com base em `gitOption`.
    - Adicionar a lógica para criar o canal de comunicação padrão.

    ```typescript
    // src/main/modules/project-management/application/commands/create-project.handler.ts
    // ... imports existentes ...
    import { FilesystemService } from "@/main/kernel/filesystem.service"; // Certifique-se de que está importado
    import { GitIntegrationService } from "@/main/modules/git-integration/domain/git-integration.service"; // Certifique-se de que está importado
    import { CreateChannelCommand } from "@/main/modules/communication/application/commands/create-channel.command"; // Novo import
    import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher"; // Novo import

    export class CreateProjectCommandHandler
      implements ICommandHandler<CreateProjectCommand, Project>
    {
      constructor(
        private readonly projectRepository: IProjectRepository,
        private readonly filesystemService: FilesystemService, // Injetar FilesystemService
        private readonly gitIntegrationService: GitIntegrationService, // Injetar GitIntegrationService
        private readonly cqrsDispatcher: CqrsDispatcher, // Injetar CqrsDispatcher
      ) {}

      async handle(command: CreateProjectCommand): Promise<Project> {
        const { name, description, remoteUrl, gitOption } = command.payload;
        const localPath = path.join(
          process.env.PROJECT_ROOT || "./projects",
          name,
        ); // Exemplo de path

        // 1. Verificar se o projeto já existe
        const existingProject = await this.projectRepository.findByName(name);
        if (existingProject) {
          throw new ApplicationError(
            `Project with name "${name}" already exists.`,
          );
        }

        // 2. Criar diretório do projeto
        await this.filesystemService.createDirectory(localPath);
        logger.info(`Created project directory: ${localPath}`);

        // 3. Inicializar ou clonar repositório Git
        if (gitOption === "clone") {
          if (!remoteUrl) {
            throw new ValidationError(
              "Remote URL is required for cloning a repository.",
            );
          }
          await this.gitIntegrationService.cloneRepository(
            remoteUrl,
            localPath,
          );
          logger.info(`Cloned remote repository ${remoteUrl} to ${localPath}`);
        } else {
          // gitOption === 'new'
          await this.gitIntegrationService.initializeRepository(localPath);
          logger.info(`Initialized Git repository in ${localPath}`);
        }

        // 4. Criar entidade Project
        const project = new Project({
          name,
          description,
          localPath,
          remoteUrl,
        });
        await this.projectRepository.save(project);
        logger.info(`Saved project ${project.id} to database`);

        // 5. Criar canal de comunicação padrão (e.g., #general)
        // Assumindo que o módulo de comunicação tem um comando CreateChannelCommand
        await this.cqrsDispatcher.dispatchCommand(
          new CreateChannelCommand({
            projectId: project.id,
            name: "general",
            type: "text", // Ou outro tipo padrão
          }),
        );
        logger.info(
          `Created default channel 'general' for project ${project.id}`,
        );

        return project;
      }
    }
    ```

3.  **Atualizar `Project` entity (se necessário):**
    - Verificar se o construtor da entidade `Project` em `src/main/modules/project-management/domain/project.entity.ts` já aceita `description` e `remoteUrl`. Pela análise inicial, o esquema já os possui, então o construtor provavelmente já os aceita. Se não, adicione-os.

    ```typescript
    // src/main/modules/project-management/domain/project.entity.ts
    // ...
    export const ProjectPropsSchema = z.object({
      name: z.string().min(1, "Project name cannot be empty"),
      description: z.string().optional(), // Certifique-se de que é opcional
      localPath: z.string().min(1),
      remoteUrl: z.string().optional(), // Certifique-se de que é opcional
      createdAt: z.date(),
      updatedAt: z.date(),
    });

    export class Project extends BaseEntity<ProjectProps> {
      constructor(props: ProjectProps, id?: string) {
        super(props, id);
        ProjectPropsSchema.parse(props); // Validação com Zod
      }
      // ...
    }
    ```

4.  **Criar Comando e Handler para `CreateChannel` (se não existirem):**
    - Se o módulo `communication` ainda não tiver um comando para criar canais, crie `CreateChannelCommand` e `CreateChannelCommandHandler`.

    ```typescript
    // src/main/modules/communication/application/commands/create-channel.command.ts
    import { ICommand } from "@/main/kernel/cqrs-dispatcher";
    import { ChannelType } from "@/main/modules/communication/domain/channel.entity"; // Defina ChannelType

    export interface ICreateChannelCommandPayload {
      projectId: string;
      name: string;
      type: ChannelType;
    }

    export class CreateChannelCommand
      implements ICommand<ICreateChannelCommandPayload>
    {
      readonly type = "CreateChannelCommand";
      constructor(public payload: ICreateChannelCommandPayload) {}
    }

    // src/main/modules/communication/application/commands/create-channel.handler.ts
    import { ICommandHandler } from "@/main/kernel/cqrs-dispatcher";
    import {
      CreateChannelCommand,
      ICreateChannelCommandPayload,
    } from "./create-channel.command";
    import { IChannelRepository } from "@/main/modules/communication/domain/channel.repository"; // Crie este repositório se não existir
    import { Channel } from "@/main/modules/communication/domain/channel.entity";
    import { ApplicationError } from "@/main/errors/application.error";

    export class CreateChannelCommandHandler
      implements ICommandHandler<CreateChannelCommand, Channel>
    {
      constructor(private readonly channelRepository: IChannelRepository) {}

      async handle(command: CreateChannelCommand): Promise<Channel> {
        try {
          const { projectId, name, type } = command.payload;
          const channel = Channel.create({ projectId, name, type }); // Assumindo um método estático create
          await this.channelRepository.save(channel);
          return channel;
        } catch (error) {
          throw new ApplicationError(
            `Failed to create channel: ${(error as Error).message}`,
          );
        }
      }
    }
    ```

5.  **Registrar `CreateChannelCommand` e `CreateChannelCommandHandler`:**
    - No `src/main/modules/communication/index.ts`, registre o novo comando e seu handler no `CqrsDispatcher`.

    ```typescript
    // src/main/modules/communication/index.ts
    // ... imports existentes ...
    import {
      CreateChannelCommand,
      CreateChannelCommandHandler,
    } from "./application/commands/create-channel.command";
    import { DrizzleChannelRepository } from "./persistence/drizzle-channel.repository"; // Crie este repositório se não existir

    export function registerCommunicationModule(
      cqrsDispatcher: CqrsDispatcher,
      db: any,
    ) {
      const channelRepository = new DrizzleChannelRepository(db); // Instanciar repositório
      const createChannelCommandHandler = new CreateChannelCommandHandler(
        channelRepository,
      );

      cqrsDispatcher.registerCommandHandler<CreateChannelCommand, Channel>(
        CreateChannelCommand.name,
        createChannelCommandHandler.handle.bind(createChannelCommandHandler),
      );

      // ... outros registros de handlers existentes ...
    }
    ```

### 3.3. Testes e Verificação

**Objetivo:** Garantir que as novas funcionalidades funcionem conforme o esperado e não introduzam regressões.

**Passos:**

1.  **Testes Unitários:**
    - Atualizar os testes existentes para `CreateProjectCommand` em `src/main/modules/project-management/project-management.test.ts` para incluir os novos campos (`description`, `remoteUrl`, `gitOption`).
    - Adicionar casos de teste para:
      - Criação de projeto com descrição.
      - Criação de projeto com inicialização Git (`gitOption: 'new'`).
      - Criação de projeto com clonagem Git (`gitOption: 'clone'`) e URL válida.
      - Criação de projeto com clonagem Git e URL inválida/vazia (deve falhar).
      - Verificar se o canal padrão (`#general`) é criado após a criação do projeto.
    - Se novos comandos/handlers foram criados para o módulo `communication`, escrever testes unitários para eles.

2.  **Testes de Integração (Manual/E2E):**
    - Iniciar a aplicação Electron.
    - Navegar até a interface de criação de projeto.
    - Testar a criação de um projeto com apenas o nome.
    - Testar a criação de um projeto com nome e descrição.
    - Testar a criação de um projeto com a opção "Criar novo repositório".
    - Testar a criação de um projeto com a opção "Clonar repositório existente" e uma URL de repositório válida (e.g., um repositório público de teste).
    - Testar a criação de um projeto com a opção "Clonar repositório existente" e uma URL inválida para verificar o tratamento de erros.
    - Verificar se os projetos criados aparecem na lista de projetos.
    - (Opcional) Inspecionar o banco de dados local para confirmar que os dados do projeto e do canal foram persistidos corretamente.

## 4. Considerações Adicionais

- **Validação de URL:** A validação da URL do repositório remoto no frontend e no backend deve ser robusta. No frontend, pode-se usar regex ou bibliotecas de validação. No backend, o `GitIntegrationService` deve lidar com erros de URL inválida ou inacessível.
- **Feedback ao Usuário:** Melhorar o feedback visual na UI durante o processo de criação (e.g., spinners, mensagens de sucesso/erro mais detalhadas).
- **Caminho do Projeto:** O `localPath` no `CreateProjectCommandHandler` está usando `process.env.PROJECT_ROOT || './projects'`. É importante garantir que `PROJECT_ROOT` esteja configurado corretamente no ambiente de execução da aplicação.
- **Internacionalização (i18n):** Se a aplicação suporta múltiplos idiomas, as novas strings na UI e nas mensagens de erro devem ser adicionadas aos arquivos de internacionalização (`locales/`).
- **Segurança:** Garantir que a clonagem de repositórios remotos seja feita de forma segura, evitando injeção de comandos ou acesso a recursos não autorizados. O `GitIntegrationService` já parece usar `execa` para executar comandos Git, o que é uma boa prática.
- **Tratamento de Erros:** As mensagens de erro devem ser claras e úteis para o usuário, indicando o que deu errado e, se possível, como corrigir.

Este plano detalha as modificações necessárias para implementar o caso de uso "Criação de um Novo Projeto", cobrindo tanto o frontend quanto o backend, e incluindo considerações sobre testes e boas práticas.
