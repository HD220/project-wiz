import { injectable, inject } from "inversify";

import { ANNOTATION_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { AgentId } from "@/core/domain/agent/value-objects/agent-id.vo";
import { Annotation } from "@/core/domain/annotation/annotation.entity";
import { IAnnotationRepository } from "@/core/domain/annotation/ports/annotation-repository.interface";
import { AnnotationId } from "@/core/domain/annotation/value-objects/annotation-id.vo";
import { AnnotationText } from "@/core/domain/annotation/value-objects/annotation-text.vo";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";

import {
  SaveAnnotationUseCaseInput,
  SaveAnnotationUseCaseOutput,
} from "./save-annotation.schema";

@injectable()
export class SaveAnnotationUseCase
  implements
    IUseCase<
      SaveAnnotationUseCaseInput,
      SaveAnnotationUseCaseOutput
    >
{
  constructor(
    @inject(ANNOTATION_REPOSITORY_INTERFACE_TYPE)
    private readonly annotationRepository: IAnnotationRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  public async execute(input: SaveAnnotationUseCaseInput): Promise<SaveAnnotationUseCaseOutput> {
    const { id, text, jobId, agentId } = input;

    const annotationId = id ? AnnotationId.fromString(id) : AnnotationId.generate();
    const annotationText = AnnotationText.create(text);
    const annotationJobId = jobId ? JobIdVO.create(jobId) : null;
    const annotationAgentId = agentId ? AgentId.fromString(agentId) : null;

    const annotation = Annotation.create({
      id: annotationId,
      text: annotationText,
      jobId: annotationJobId,
      agentId: annotationAgentId,
    });

    await this.annotationRepository.save(annotation);

    return {
      annotationId: annotation.id.value,
      createdAt: annotation.createdAt.toISOString(),
      updatedAt: annotation.updatedAt.toISOString(),
    };
  }
}