// src/electron/dependency-injection/types.ts

export const TYPES = {
    // Repositories
    IJobRepository: Symbol.for("IJobRepository"),
    IPersonaRepository: Symbol.for("IPersonaRepository"),
    IAgentRepository: Symbol.for("IAgentRepository"), // Added IAgentRepository
    IAgentRuntimeStateRepository: Symbol.for("IAgentRuntimeStateRepository"),
    IProjectRepository: Symbol.for("IProjectRepository"),
    IUserRepository: Symbol.for("IUserRepository"),
    IWorkerRepository: Symbol.for("IWorkerRepository"),
    IQueueRepository: Symbol.for("IQueueRepository"), // Assuming this is for Queue entity, not IJobQueue
    ILLMProviderRepository: Symbol.for("ILLMProviderRepository"),
    ILLMProviderConfigRepository: Symbol.for("ILLMProviderConfigRepository"),
    ISourceCodeRepository: Symbol.for("ISourceCodeRepository"),
    // Adicionar ILLMModelRepository se for criado no futuro
    // ILLMModelRepository: Symbol.for("ILLMModelRepository"),

    // Job Queue specific interface (distinct from IQueueRepository for the Queue entity)
    IJobQueue: Symbol.for("IJobQueue"),

    // Application Services
    IAgentService: Symbol.for("IAgentService"),
    IProcessJobService: Symbol.for("IProcessJobService"),
    IWorkerAssignmentService: Symbol.for("IWorkerAssignmentService"),
    // Adicionar outros serviços de aplicação aqui

    // Factories
    ITaskFactory: Symbol.for("ITaskFactory"),

    // Adapters (Ports para sistemas externos)
    ILLM: Symbol.for("ILLM"),
    IFileSystem: Symbol.for("IFileSystem"),
    IVersionControlSystem: Symbol.for("IVersionControlSystem"),

    // Casos de Uso (opcional, podem ser auto-vinculados se não houver interfaces específicas para eles)
    // Exemplo se tivéssemos interfaces para UCs:
    // ICreateJobUseCase: Symbol.for("ICreateJobUseCase"),
    // Por enquanto, vamos assumir que os UCs são classes concretas e podem ser auto-vinculados ou vinculados à sua própria classe.

    // Infraestrutura - Componentes específicos
    // DB Instance (exemplo, pode variar como é injetado)
    // DrizzleDB: Symbol.for("DrizzleDB"),
    // O cliente DB Drizzle geralmente é passado para o construtor dos repositórios.
    // O container pode ser responsável por criar e injetar esta instância do DB.
    DrizzleDBInstance: Symbol.for("DrizzleDBInstance"),

    // Worker Pool
    IWorkerPool: Symbol.for("IWorkerPool"),
};
