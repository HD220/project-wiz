import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
} from "../../../shared/types/llm-provider.types";
import type { LlmProvider } from "../../modules/llm-provider/domain/llm-provider.entity";

export interface ILlmProviderService {
  createLlmProvider(data: CreateLlmProviderDto): Promise<LlmProvider>;
  getLlmProviderById(id: string): Promise<LlmProvider | null>;
  getLlmProviderByName(name: string): Promise<LlmProvider | null>;
  getAllLlmProviders(): Promise<LlmProvider[]>;
  updateLlmProvider(
    id: string,
    data: UpdateLlmProviderDto,
  ): Promise<LlmProvider>;
  deleteLlmProvider(id: string): Promise<void>;
  setAsDefault(id: string): Promise<void>;
  getDefaultLlmProvider(): Promise<LlmProvider | null>;
}
