// src/core/application/use-cases/memory/save-memory-item.usecase.ts
import { MemoryItem, MemoryItemProps } from '../../../domain/entities/memory/memory.entity';
import { IMemoryRepository } from '../../../../core/ports/repositories/memory.repository';

export type SaveMemoryItemDTO =
  Partial<Pick<MemoryItemProps, 'id' | 'tags' | 'source' | 'embedding'>> &
  { content: string };

export interface ISaveMemoryItemUseCase {
  execute(data: SaveMemoryItemDTO): Promise<MemoryItem>;
}

export class SaveMemoryItemUseCase implements ISaveMemoryItemUseCase {
  constructor(private memoryRepository: IMemoryRepository) {}

  async execute(data: SaveMemoryItemDTO): Promise<MemoryItem> {
    console.log(\`SaveMemoryItemUseCase: Saving memory item (ID: \${data.id || 'new'})\`);
    let memoryItemToSave: MemoryItem;

    if (data.id) {
      const existingItem = await this.memoryRepository.findById(data.id);
      if (existingItem) {
        existingItem.updateContent(data.content, data.tags);
        if (data.source !== undefined) existingItem.source = data.source;
        if (data.embedding !== undefined) existingItem.embedding = data.embedding;
        memoryItemToSave = existingItem;
      } else {
        // If ID provided but not found, create new but use the provided ID.
        memoryItemToSave = new MemoryItem({ ...data, id: data.id });
      }
    } else {
      memoryItemToSave = MemoryItem.create(data);
    }

    await this.memoryRepository.save(memoryItemToSave);
    return memoryItemToSave; // Return the saved/updated instance
  }
}
