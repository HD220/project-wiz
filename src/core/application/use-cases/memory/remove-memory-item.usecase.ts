// src/core/application/use-cases/memory/remove-memory-item.usecase.ts
import { IMemoryRepository } from '../../../../core/ports/repositories/memory.repository';

export interface IRemoveMemoryItemUseCase {
  execute(memoryItemId: string): Promise<void>;
}

export class RemoveMemoryItemUseCase implements IRemoveMemoryItemUseCase {
  constructor(private memoryRepository: IMemoryRepository) {}

  async execute(memoryItemId: string): Promise<void> {
    console.log(\`RemoveMemoryItemUseCase: Removing memory item \${memoryItemId}\`);
    const item = await this.memoryRepository.findById(memoryItemId);
    if (!item) {
      throw new Error(\`Memory item with id \${memoryItemId} not found.\`);
    }
    await this.memoryRepository.delete(memoryItemId);
    console.log(\`RemoveMemoryItemUseCase: Memory item \${memoryItemId} removed.\`);
  }
}
