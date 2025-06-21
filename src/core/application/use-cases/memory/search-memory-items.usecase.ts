// src/core/application/use-cases/memory/search-memory-items.usecase.ts
import { MemoryItem } from '../../../domain/entities/memory/memory.entity';
import { IMemoryRepository } from '../../../../core/ports/repositories/memory.repository';

export interface SearchMemoryItemsDTO {
  query: string;
  tags?: string[];
  limit?: number;
}

export interface ISearchMemoryItemsUseCase {
  execute(dto: SearchMemoryItemsDTO): Promise<MemoryItem[]>;
}

export class SearchMemoryItemsUseCase implements ISearchMemoryItemsUseCase {
  constructor(private memoryRepository: IMemoryRepository) {}

  async execute(dto: SearchMemoryItemsDTO): Promise<MemoryItem[]> {
    console.log(\`SearchMemoryItemsUseCase: Searching memories with query "\${dto.query}"\`);
    return this.memoryRepository.search(dto.query, dto.tags, dto.limit);
  }
}
