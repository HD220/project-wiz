import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/shared/result";
import {
  CreateUserUseCaseInput,
  CreateUserUseCaseOutput,
  CreateUserUseCaseInputSchema,
} from "./create-user.schema"; // Import from new schema file
import { DomainError } from "@/core/common/errors";
import { User } from "@/core/domain/entities/user"; // Import User entity
import {
  UserId, // Import UserId
  UserNickname,
  UserUsername,
  UserEmail,
  UserAvatar,
} from "@/core/domain/entities/user/value-objects";
import { LLMProviderConfig } from "@/core/domain/entities/llm-provider-config"; // Import LLMProviderConfig entity
import { LLMProviderConfigId } from "@/core/domain/entities/llm-provider-config/value-objects";
import { IUserRepository } from "@/core/ports/repositories/user.interface";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";
import { slugfy } from "@/shared/slugfy";


export class CreateUserUseCase
  implements Executable<CreateUserUseCaseInput, Result<CreateUserUseCaseOutput>>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
  ) {}

  async execute(
    data: CreateUserUseCaseInput
  ): Promise<Result<CreateUserUseCaseOutput>> {
    try {
      const validationResult = CreateUserUseCaseInputSchema.safeParse(data);
      if (!validationResult.success) {
        return error(validationResult.error.flatten().fieldErrors as any); // Cast for simplicity
      }
      const validInput = validationResult.data;

      const llmConfigIdVo = LLMProviderConfigId.create(validInput.llmProviderConfigId);

      const llmConfigResult = await this.llmProviderConfigRepository.load(llmConfigIdVo);
      if (llmConfigResult.isError()) {
        return error(new DomainError(`Failed to load LLMProviderConfig: ${llmConfigResult.message}`));
      }
      const llmProviderConfig = llmConfigResult.value;
      if (!llmProviderConfig) {
        return error(new DomainError(`LLMProviderConfig not found: ${llmConfigIdVo.getValue()}`));
      }

      const userId = UserId.create(); // Generates new ID (assuming UserId.create() does this)
      const nicknameVo = UserNickname.create(validInput.user.nickname);

      let usernameToSlug = validInput.user.username;
      if (!usernameToSlug || usernameToSlug.trim() === "") {
          usernameToSlug = validInput.user.nickname;
      }
      const usernameVo = UserUsername.create(slugfy(usernameToSlug));

      const emailVo = UserEmail.create(validInput.user.email);
      const avatarVo = UserAvatar.create(validInput.user.avatarUrl);

      const user = User.create({ // Use static User.create method
        id: userId,
        nickname: nicknameVo,
        username: usernameVo,
        email: emailVo,
        avatar: avatarVo,
        defaultLLMProviderConfigId: llmProviderConfig.id(), // Use id() method
        // assistantId is optional and not defined here
      });

      await this.userRepository.save(user); // Use save method

      return ok({
        userId: user.id().getValue(), // Use id() and getValue()
      });
    } catch (err) {
      console.error("Error in CreateUserUseCase:", err); // Log the actual error
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(new DomainError(errorMessage));
    }
  }
}

// Removed local type CreateUserUseCaseInput and CreateUserUseCaseOutput
