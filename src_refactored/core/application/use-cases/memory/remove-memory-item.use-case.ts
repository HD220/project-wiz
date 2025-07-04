import { injectable, inject } from "inversify";

import { MEMORY_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { IMemoryRepository } from "@/core/domain/memory/ports/memory-repository.interface";
import { MemoryItemId } from "@/core/domain/memory/value-objects/memory-item-id.vo";

import {
  RemoveMemoryItemUseCaseInput,
  RemoveMemoryItemUseCaseOutput,
} from "./remove-memory-item.schema";

@injectable()
export class RemoveMemoryItemUseCase
  implements
    IUseCase<
      RemoveMemoryItemUseCaseInput,
      RemoveMemoryItemUseCaseOutput
    >
{
  constructor(
    @inject(MEMORY_REPOSITORY_INTERFACE_TYPE)
    private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  public async execute(input: RemoveMemoryItemUseCaseInput): Promise<RemoveMemoryItemUseCaseOutput> {
    const { memoryItemId } = input;
    const id = MemoryItemId.fromString(memoryItemId);

    await this.memoryRepository.delete(id);

    return { success: true, memoryItemId: id.value };
  }
}