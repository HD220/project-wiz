// src/core/application/use-cases/memory/save-memory-item.usecase.ts
import { MemoryItem, MemoryItemProps } from '../../../domain/entities/memory/memory.entity';
import { IMemoryRepository } from '../../../../core/ports/repositories/memory.repository';
// TODO: Refactor to use IEmbeddingService (port) instead of concrete EmbeddingService (infra) for Clean Architecture.
import { EmbeddingService } from '../../../infrastructure/services/ai/embedding.service';

export type SaveMemoryItemDTO =
  Partial<Pick<MemoryItemProps, 'id' | 'tags' | 'source' | 'embedding' | 'agentId'>> &
  { content: string };

export interface ISaveMemoryItemUseCase {
  execute(data: SaveMemoryItemDTO): Promise<MemoryItem>;
}

export class SaveMemoryItemUseCase implements ISaveMemoryItemUseCase {
  constructor(
    private memoryRepository: IMemoryRepository,
    private embeddingService: EmbeddingService // Added
  ) {}

  async execute(data: SaveMemoryItemDTO): Promise<MemoryItem> {
    console.log(\`SaveMemoryItemUseCase: Saving memory item (ID: \${data.id || 'new'})\`);
    let memoryItemToSave: MemoryItem;

    if (data.id) {
      const existingItem = await this.memoryRepository.findById(data.id);
      if (existingItem) {
        // Only update content if it's different, to avoid re-generating embedding unnecessarily
        const contentChanged = data.content !== existingItem.content;
        existingItem.updateContent(data.content, data.tags); // This updates text and optionally tags
        if (data.source !== undefined) existingItem.source = data.source;
        // existingItem.embedding is not directly set from data.embedding; it's generated.
        if (data.agentId !== undefined) existingItem.agentId = data.agentId;
        memoryItemToSave = existingItem;

        if (contentChanged && memoryItemToSave.content.trim() !== "") {
          console.log(\`SaveMemoryItemUseCase: Content changed for item \${memoryItemToSave.id}, regenerating embedding.\`);
          const { embedding: newEmbedding } = await this.embeddingService.generateEmbedding(memoryItemToSave.content);
          memoryItemToSave.embedding = newEmbedding;
        } else if (!memoryItemToSave.embedding && memoryItemToSave.content.trim() !== "") {
          // If embedding doesn't exist (e.g. old item) and content is present, generate it.
          console.log(\`SaveMemoryItemUseCase: Item \${memoryItemToSave.id} missing embedding, generating.\`);
          const { embedding: newEmbedding } = await this.embeddingService.generateEmbedding(memoryItemToSave.content);
          memoryItemToSave.embedding = newEmbedding;
        }

      } else {
        // ID provided but not found, create a new MemoryItem instance with the given ID
        memoryItemToSave = new MemoryItem({
          id: data.id, // Use the provided ID
          content: data.content,
          tags: data.tags,
          source: data.source,
          agentId: data.agentId,
          // embedding is not taken from data.embedding, will be generated next
        });
        if (memoryItemToSave.content.trim() !== "") {
          const { embedding } = await this.embeddingService.generateEmbedding(memoryItemToSave.content);
          memoryItemToSave.embedding = embedding;
          console.log(\`SaveMemoryItemUseCase: Generated embedding for new item (with provided ID) \${memoryItemToSave.id}\`);
        }
      }
    } else {
      // No ID provided, create a new MemoryItem
      memoryItemToSave = MemoryItem.create({ // MemoryItem.create will generate a new UUID
        content: data.content,
        tags: data.tags,
        source: data.source,
        agentId: data.agentId,
        // embedding is not taken from data.embedding, will be generated next
      });
      if (memoryItemToSave.content.trim() !== "") {
        const { embedding } = await this.embeddingService.generateEmbedding(memoryItemToSave.content);
        memoryItemToSave.embedding = embedding;
        console.log(\`SaveMemoryItemUseCase: Generated embedding for new item \${memoryItemToSave.id}\`);
      }
    }

    await this.memoryRepository.save(memoryItemToSave);
    console.log(\`SaveMemoryItemUseCase: Memory item \${memoryItemToSave.id} saved \${memoryItemToSave.embedding ? 'with' : 'without an'} embedding.\`);
    return memoryItemToSave;
  }
}
