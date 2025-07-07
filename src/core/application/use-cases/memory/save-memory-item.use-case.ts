import { injectable, inject } from "inversify";

import { MEMORY_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/logger.port";
import { Identity } from "@/core/common/value-objects/identity.vo";
import { MemoryItem } from "@/core/domain/memory/memory-item.entity";
import { IMemoryRepository } from "@/core/domain/memory/ports/memory-repository.interface";
import { MemoryItemContent } from "@/core/domain/memory/value-objects/memory-item-content.vo";
import { MemoryItemEmbedding } from "@/core/domain/memory/value-objects/memory-item-embedding.vo";
import { MemoryItemId } from "@/core/domain/memory/value-objects/memory-item-id.vo";
import { MemoryItemSource } from "@/core/domain/memory/value-objects/memory-item-source.vo";
import { MemoryItemTags } from "@/core/domain/memory/value-objects/memory-item-tags.vo";

import {
  SaveMemoryItemUseCaseInput,
  SaveMemoryItemUseCaseOutput,
} from "./save-memory-item.schema";

@injectable()
export class SaveMemoryItemUseCase
  implements
    IUseCase<
      SaveMemoryItemUseCaseInput,
      SaveMemoryItemUseCaseOutput
    >
{
  constructor(
    @inject(MEMORY_REPOSITORY_INTERFACE_TYPE) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  public async execute(input: SaveMemoryItemUseCaseInput): Promise<SaveMemoryItemUseCaseOutput> {
    const { id, content, agentId, tags, source, embedding } = input;

    const memoryItemId = id ? MemoryItemId.fromString(id) : MemoryItemId.generate();
    const memoryItemContent = MemoryItemContent.create(content);
    const memoryItemAgentId = agentId ? Identity.fromString(agentId) : null;
    const memoryItemTags = tags ? MemoryItemTags.create(tags) : MemoryItemTags.create([]);
    const memoryItemSource = source === null || source === undefined ? undefined : MemoryItemSource.create(source);
    const memoryItemEmbedding = embedding ? MemoryItemEmbedding.create(embedding) : undefined;

    const memoryItem = MemoryItem.create({
      id: memoryItemId,
      content: memoryItemContent,
      agentId: memoryItemAgentId,
      tags: memoryItemTags,
      source: memoryItemSource,
      embedding: memoryItemEmbedding,
    });

    await this.memoryRepository.save(memoryItem);

    return {
      memoryItemId: memoryItem.id.value,
      createdAt: memoryItem.createdAt.toISOString(),
      updatedAt: memoryItem.updatedAt.toISOString(),
    };
  }
}