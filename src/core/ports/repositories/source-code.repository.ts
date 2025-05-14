import { IRepository } from "@/core/common/repository";
import { SourceCode } from "@/core/domain/entities/source-code";

export type ISourceCodeRepository = IRepository<typeof SourceCode>;
