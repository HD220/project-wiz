// src/electron/dependency-injection/inversify.config.ts
import 'reflect-metadata'; // Deve ser importado uma vez, geralmente no ponto de entrada.
import { Container } from 'inversify';
import { TYPES } from './types';

// Importações do Banco de Dados Drizzle
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../../infrastructure/services/drizzle/schemas'; // Importar todos os schemas Drizzle

// Importações das Interfaces de Repositório (de core/application/ports/repositories)
import { IJobRepository } from '../../core/application/ports/repositories/job.repository.interface';
import { IPersonaRepository } from '../../core/application/ports/repositories/persona.repository.interface';
import { IAgentRuntimeStateRepository } from '../../core/application/ports/repositories/agent-runtime-state.repository.interface';
import { IProjectRepository } from '../../core/application/ports/repositories/project.repository.interface';
import { IUserRepository } from '../../core/application/ports/repositories/user.repository.interface';
import { IWorkerRepository } from '../../core/application/ports/repositories/worker.repository.interface';
import { IQueueRepository } from '../../core/application/ports/repositories/queue.repository.interface';
import { ILLMProviderRepository } from '../../core/application/ports/repositories/llm-provider.repository.interface';
import { ILLMProviderConfigRepository } from '../../core/application/ports/repositories/llm-provider-config.repository.interface';
import { ISourceCodeRepository } from '../../core/application/ports/repositories/source-code.repository.interface';
import { IAgentRepository } from '../../core/application/ports/repositories/agent.repository.interface';
// import { ILLMModelRepository } from '../../core/application/ports/repositories/llm-model.repository.interface'; // Uncomment if ILLMModelRepository is created

// Importações das Implementações de Repositório Drizzle (de infrastructure/repositories)
import { JobDrizzleRepository } from '../../infrastructure/repositories/job-drizzle.repository';
import { PersonaDrizzleRepository } from '../../infrastructure/repositories/persona-drizzle.repository';
import { AgentRuntimeStateDrizzleRepository } from '../../infrastructure/repositories/agent-runtime-state-drizzle.repository';
import { ProjectDrizzleRepository } from '../../infrastructure/repositories/project-drizzle.repository';
import { UserDrizzleRepository } from '../../infrastructure/repositories/user-drizzle.repository';
import { WorkerDrizzleRepository } from '../../infrastructure/repositories/worker-drizzle.repository';
import { QueueDrizzleRepository } from '../../infrastructure/repositories/queue-drizzle.repository';
import { LLMProviderDrizzleRepository } from '../../infrastructure/repositories/llm-provider-drizzle.repository';
import { LLMProviderConfigDrizzleRepository } from '../../infrastructure/repositories/llm-provider-config-drizzle.repository';
import { SourceCodeDrizzleRepository } from '../../infrastructure/repositories/source-code-drizzle.repository';
import { AgentDrizzleRepository } from '../../infrastructure/repositories/agent-drizzle.repository';
// import { LLMModelDrizzleRepository } from '../../infrastructure/repositories/llm-model-drizzle.repository'; // Uncomment if ILLMModelDrizzleRepository is created


const appContainer = new Container();

// 1. Registrar o Cliente DB Drizzle
const DATABASE_URL = process.env.DATABASE_URL || './project-wiz.db'; // TODO: Consider moving DB URL to a config file/service

appContainer.bind<BetterSQLite3Database<typeof schema>>(TYPES.DrizzleDBInstance)
    .toDynamicValue(() => {
        const sqlite = new Database(DATABASE_URL);
        // sqlite.pragma('journal_mode = WAL'); // Optional: for better concurrency, requires testing
        console.log(`Drizzle DB Initialized at ${DATABASE_URL}`);
        return drizzle(sqlite, { schema });
    }).inSingletonScope();

// 2. Registrar Repositórios
// Using toDynamicValue as repository constructors are not yet decorated with @injectable and @inject for direct DI.
// If they were, .to(ConcreteRepositoryClass) would suffice.

appContainer.bind<IJobRepository>(TYPES.IJobRepository)
    .toDynamicValue(context => new JobDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance)))
    .inSingletonScope();

appContainer.bind<IPersonaRepository>(TYPES.IPersonaRepository)
    .toDynamicValue(context => new PersonaDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance)))
    .inSingletonScope();

appContainer.bind<IAgentRepository>(TYPES.IAgentRepository)
    .toDynamicValue(context => {
        // AgentDrizzleRepository might need IPersonaRepository and ILLMProviderConfigRepository if it resolves them itself.
        // For now, assuming its constructor only takes DB or that these will be added later.
        // Example if AgentDrizzleRepository constructor was: constructor(db, personaRepo, llmConfigRepo)
        // const personaRepo = context.container.get<IPersonaRepository>(TYPES.IPersonaRepository);
        // const llmConfigRepo = context.container.get<ILLMProviderConfigRepository>(TYPES.ILLMProviderConfigRepository);
        // return new AgentDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance), personaRepo, llmConfigRepo);
        return new AgentDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance));
    })
    .inSingletonScope();

appContainer.bind<IAgentRuntimeStateRepository>(TYPES.IAgentRuntimeStateRepository)
    .toDynamicValue(context => new AgentRuntimeStateDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance)))
    .inSingletonScope();

appContainer.bind<IProjectRepository>(TYPES.IProjectRepository)
    .toDynamicValue(context => new ProjectDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance)))
    .inSingletonScope();

appContainer.bind<IUserRepository>(TYPES.IUserRepository)
    .toDynamicValue(context => new UserDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance)))
    .inSingletonScope();

appContainer.bind<IWorkerRepository>(TYPES.IWorkerRepository)
    .toDynamicValue(context => new WorkerDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance)))
    .inSingletonScope();

appContainer.bind<IQueueRepository>(TYPES.IQueueRepository)
    .toDynamicValue(context => new QueueDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance)))
    .inSingletonScope();

// TODO: Uncomment and implement ILLMModelRepository if/when it's created and needed by LLMProvider or LLMProviderConfig repos
// appContainer.bind<ILLMModelRepository>(TYPES.ILLMModelRepository)
//     .toDynamicValue(context => new LLMModelDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance)))
//     .inSingletonScope();

appContainer.bind<ILLMProviderRepository>(TYPES.ILLMProviderRepository)
    .toDynamicValue(context => {
        // const modelRepository = context.container.get<ILLMModelRepository>(TYPES.ILLMModelRepository); // If needed
        return new LLMProviderDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance) /*, modelRepository */);
    })
    .inSingletonScope();

appContainer.bind<ILLMProviderConfigRepository>(TYPES.ILLMProviderConfigRepository)
    .toDynamicValue(context => {
        const providerRepository = context.container.get<ILLMProviderRepository>(TYPES.ILLMProviderRepository);
        // const modelRepository = context.container.get<ILLMModelRepository>(TYPES.ILLMModelRepository); // If needed
        return new LLMProviderConfigDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance), providerRepository /*, modelRepository */);
    })
    .inSingletonScope();

appContainer.bind<ISourceCodeRepository>(TYPES.ISourceCodeRepository)
    .toDynamicValue(context => new SourceCodeDrizzleRepository(context.container.get(TYPES.DrizzleDBInstance)))
    .inSingletonScope();


// TODO: Registrar Adapters (ILLM, IFileSystem, IVersionControlSystem)
// TODO: Registrar Factories (ITaskFactory)
// TODO: Registrar Serviços de Aplicação (IAgentService, IProcessJobService, IWorkerAssignmentService, IJobQueue)
// TODO: Registrar Casos de Uso (se não forem auto-vinculados)
// TODO: Registrar IWorkerPool

// --- Importações Adicionais para Serviços, Adapters, Factories ---

// Adapters
import { ILLM } from '../../core/application/llms/llm.interface';
import { OpenAIAdapter } from '../../infrastructure/adapters/llm/openai.adapter';
import { IFileSystem } from '../../core/application/ports/adapters/file-system.interface'; // Corrected path
import { NodeFileSystemAdapter } from '../../infrastructure/adapters/file-system/node-file-system.adapter';
import { IVersionControlSystem } from '../../core/application/ports/adapters/version-control-system.interface'; // Corrected path
import { SimpleGitAdapter } from '../../infrastructure/adapters/vcs/simple-git.adapter';

// Factories
import { ITaskFactory } from '../../core/application/factories/task.factory.interface';
import { TaskFactoryImpl } from '../../infrastructure/tasks/task.factory'; // Corrected path

// Application Services
import { IAgentService } from '../../core/application/ports/agent-service.interface';
import { AgentServiceImpl } from '../../core/application/services/agent.service';
import { IProcessJobService } from '../../core/application/ports/process-job-service.interface';
import { ProcessJobServiceImpl } from '../../core/application/services/process-job.service';
import { IWorkerAssignmentService } from '../../core/application/ports/worker-assignment-service.interface';
import { WorkerAssignmentServiceImpl } from '../../core/application/services/worker-assignment.service';
import { IJobQueue } from '../../core/application/ports/job-queue.interface';
import { SqliteJobQueue } from '../../infrastructure/queue/sqlite-job-queue';


// --- Registros Adicionais ---

// 3. Adapters
appContainer.bind<ILLM>(TYPES.ILLM).toDynamicValue(() => {
    return new OpenAIAdapter(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL_NAME || "gpt-4o-mini");
}).inSingletonScope();

// Assuming NodeFileSystemAdapter and SimpleGitAdapter don't have constructor dependencies for now.
// If they do, they would need to be resolved via context.container.get(...)
appContainer.bind<IFileSystem>(TYPES.IFileSystem).to(NodeFileSystemAdapter).inSingletonScope();
appContainer.bind<IVersionControlSystem>(TYPES.IVersionControlSystem).to(SimpleGitAdapter).inSingletonScope();


// 4. Factories
appContainer.bind<ITaskFactory>(TYPES.ITaskFactory).toDynamicValue(context => {
    // TaskFactoryImpl might need ILLM, IFileSystem, IVersionControlSystem, etc.
    // For now, only injecting ILLM as per prompt.
    return new TaskFactoryImpl(context.container.get<ILLM>(TYPES.ILLM) /*, other deps */);
}).inSingletonScope();


// 5. Application Services
appContainer.bind<IAgentService>(TYPES.IAgentService).toDynamicValue(context => {
    return new AgentServiceImpl(
        context.container.get<ILLM>(TYPES.ILLM),
        context.container.get<ITaskFactory>(TYPES.ITaskFactory)
        // Add IToolRegistry or other dependencies if AgentServiceImpl constructor requires them
    );
}).inSingletonScope();

appContainer.bind<IJobQueue>(TYPES.IJobQueue).toDynamicValue(context => {
    // SqliteJobQueue constructor needs IJobRepository
    return new SqliteJobQueue(context.container.get<IJobRepository>(TYPES.IJobRepository));
}).inSingletonScope();

appContainer.bind<IWorkerAssignmentService>(TYPES.IWorkerAssignmentService).toDynamicValue(context => {
    // WorkerAssignmentServiceImpl constructor needs IWorkerRepository
    return new WorkerAssignmentServiceImpl(context.container.get<IWorkerRepository>(TYPES.IWorkerRepository));
}).inSingletonScope();

appContainer.bind<IProcessJobService>(TYPES.IProcessJobService).toDynamicValue(context => {
    return new ProcessJobServiceImpl(
        context.container.get<IJobRepository>(TYPES.IJobRepository),
        context.container.get<IJobQueue>(TYPES.IJobQueue),
        context.container.get<IAgentService>(TYPES.IAgentService),
        context.container.get<IAgentRepository>(TYPES.IAgentRepository),
        context.container.get<IAgentRuntimeStateRepository>(TYPES.IAgentRuntimeStateRepository),
        context.container.get<IWorkerAssignmentService>(TYPES.IWorkerAssignmentService),
        context.container.get<ILLMProviderConfigRepository>(TYPES.ILLMProviderConfigRepository)
    );
}).inSingletonScope();


// TODO: Registrar Casos de Uso (se não forem auto-vinculados)
// TODO: Registrar IWorkerPool

// Worker Pool
import { IWorkerPool } from '../../core/application/ports/worker-pool.interface';
import { ChildProcessWorkerPool } from '../../infrastructure/worker-pool/child-process-worker-pool';

appContainer.bind<IWorkerPool>(TYPES.IWorkerPool).toDynamicValue(context => {
    const numWorkersEnv = process.env.NUM_WORKERS;
    const numWorkers = numWorkersEnv ? parseInt(numWorkersEnv, 10) : undefined;
    // If parseInt returns NaN (e.g., for an empty string or invalid number),
    // numWorkers will be NaN, and ChildProcessWorkerPool's constructor should handle it (e.g. by using os.cpus().length).
    // It's safer to check for NaN here or ensure the constructor is robust.
    const validNumWorkers = (numWorkers && !isNaN(numWorkers)) ? numWorkers : undefined;

    return new ChildProcessWorkerPool(
        context.container.get<IJobQueue>(TYPES.IJobQueue),
        validNumWorkers
    );
}).inSingletonScope();

export { appContainer };
