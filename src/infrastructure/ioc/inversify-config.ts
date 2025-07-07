import "reflect-metadata";

// Needed for new services
import EventEmitter from 'node:events';

import { Container } from "inversify";

// Bind IToolRegistryService
import { APPLICATION_TYPES } from "@/core/application/common/types";
import {
  IJobRepository,
  JOB_REPOSITORY_TOKEN,
} from "@/core/application/ports/job-repository.interface";
import { IToolRegistryService } from "@/core/application/ports/services/tool-registry.service.port";
import {
  AbstractQueue,
  getQueueServiceToken,
} from "@/core/application/queue/abstract-queue";

import { db } from "@/infrastructure/persistence/drizzle/drizzle.client.utils";
import { DrizzleJobRepository } from "@/infrastructure/persistence/drizzle/job/drizzle-job.repository";
// Old QueueService replaced by new classes
import { DrizzleQueueFacade } from "@/infrastructure/queue/drizzle/drizzle-queue.service";
import { JobProcessingService } from "@/infrastructure/queue/drizzle/job-processing.service";
import { QueueMaintenanceService } from "@/infrastructure/queue/drizzle/queue-maintenance.service";
import { QueueServiceCore } from "@/infrastructure/queue/drizzle/core-queue.service";
import { ToolRegistryService } from "@/infrastructure/services/tool-registry/tool-registry.service";

export const appContainer = new Container();

// Job Repository and Queue Service bindings
appContainer
  .bind<IJobRepository<{ [key: string]: unknown; userId?: string }, unknown>>(
    JOB_REPOSITORY_TOKEN,
  )
  .toConstantValue(new DrizzleJobRepository(db));

// Tool Registry Service binding
appContainer.bind<IToolRegistryService>(APPLICATION_TYPES.IToolRegistryService).to(ToolRegistryService).inSingletonScope();

appContainer
  .bind<AbstractQueue<{ [key: string]: unknown; userId?: string }, unknown>>(
    getQueueServiceToken("default"),
  )
  .toDynamicValue((context) => {
    const jobRepository = context.get<IJobRepository<{ [key: string]: unknown; userId?: string }, unknown>>(JOB_REPOSITORY_TOKEN);
    // Or derive from token if more queues are added
    const queueName = "default";

    // Create a shared EventEmitter instance for this queue setup
    // Or, if AbstractQueue (and thus Facade) is the primary emitter, pass `facade` itself if services need to emit through it.
    // For now, let's assume services take a raw emitter they use, and the facade also uses one (its own, from AbstractQueue).
    // This might need refinement based on how events are intended to propagate.
    // If services emit their own events, and facade emits its own, they are separate.
    // If facade is the *sole* emitter for AbstractQueue events, then services need a way to trigger those on the facade.

    // Let's assume for now that the Facade itself (as an EventEmitter via AbstractQueue)
    // is the one that should be used for emitting AbstractQueue defined events.
    // The individual services might need to be passed a reference to the facade's emit method,
    // or the facade calls their methods and then emits events.
    // The current service implementations take an EventEmitter.
    // We can create one here and pass to all three + Facade (if Facade didn't extend EventEmitter).
    // Since Facade extends AbstractQueue which extends EventEmitter, it IS an emitter.

    // Option: Instantiate services, then facade, then pass facade's emit to services.
    // This creates a circular dependency if services need emit in constructor.
    // Simpler: Services take a new emitter, facade also has its own. Events are distinct.
    // Better: Facade is the event source. Services get jobRepo & queueName. Facade orchestrates & emits.

    const coreService = new QueueServiceCore(
      queueName,
      jobRepository
      // defaultJobOptions can be undefined or fetched from config
    );

    // The eventEmitter for JobProcessingService and QueueMaintenanceService:
    // For now, these services were designed to take a generic EventEmitter.
    // The DrizzleQueueFacade itself is an EventEmitter (via AbstractQueue).
    // The most straightforward way is to pass the Facade's `this` (as an emitter)
    // to the services if they need to emit events that AbstractQueue would define.
    // However, their current constructors take a raw EventEmitter.
    // Let's create a single emitter for them for now.
    // A more advanced setup might involve the facade passing its own `emit` method bound.

    // The facade will extend AbstractQueue, which extends EventEmitter.
    // So, the facade itself is an EventEmitter.
    // The sub-services (core, processing, maintenance) also need to emit events.
    // Option 1: They all share the Facade's emitter (this).
    // Option 2: They have their own, and the Facade subscribes or is not involved in their internal events.
    // Option 3: The Facade calls their methods, and then the Facade emits the events as per AbstractQueue contract. (Chosen for now)

    // Therefore, sub-services don't necessarily need an emitter in their constructor for *AbstractQueue* events.
    // They were written to take one for their own internal/specific events.
    // Let's assume they manage their own specific events or don't emit AbstractQueue events directly.
    // The Facade will be responsible for emitting events defined by AbstractQueue.

    const processingService = new JobProcessingService(
      jobRepository,
      // Placeholder, facade will emit AbstractQueue events
      new EventEmitter(),
      queueName
    );

    const maintenanceService = new QueueMaintenanceService(
      jobRepository,
      // Placeholder, facade will emit AbstractQueue events
      new EventEmitter(),
      queueName
    );

    // The QueueServiceCore needs to be told about the maintenance service for its close() method.
    // This was part of its original design.
    // However, the Facade's close() will now coordinate this.
    // So QueueServiceCore's constructor was simplified.
    // The Facade's constructor now takes all three.

    const facade = new DrizzleQueueFacade(
      queueName,
      jobRepository,
      coreService,
      processingService,
      maintenanceService
    );

    // If QueueServiceCore needs to call stopMaintenance, it needs a reference.
    // The current QueueServiceCore has `setMaintenanceService`. The Facade could call this.
    // // Hacky, better if Facade handles it.
    // (coreService as any).setMaintenanceService(maintenanceService);
    // The Facade's close() now calls maintenanceService.stopMaintenance(), so coreService doesn't need it.

    return facade;
  })
  .inSingletonScope();
