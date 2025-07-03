// src_refactored/core/application/ports/services/i-embedding.service.ts
// Assuming EmbeddingError will be in domain/common/errors
import { EmbeddingError } from "@/core/domain/common/errors";

import { IUseCaseResponse } from "@/shared/application/use-case-response.dto";

export type EmbeddingVector = number[];

export interface IEmbeddingService {
  generateEmbedding(
    text: string,
    modelId?: string
  ): Promise<IUseCaseResponse<EmbeddingVector, EmbeddingError>>;

  generateEmbeddings(
    texts: string[],
    modelId?: string
  ): Promise<IUseCaseResponse<EmbeddingVector[], EmbeddingError>>;
}

export const IEmbeddingServiceToken = Symbol('IEmbeddingService');
