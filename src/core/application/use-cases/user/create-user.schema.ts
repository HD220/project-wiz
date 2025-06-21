import { z } from 'zod';

// Schema para o objeto 'user' aninhado
export const UserInputObjectSchema = z.object({
    nickname: z.string().min(1, "Nickname cannot be empty."),
    username: z.string().min(1, "Username cannot be empty.").optional(), // Username pode ser opcional
    email: z.string().email("Invalid email format."),
    avatarUrl: z.string().url("Avatar URL must be a valid URL."),
});
export type UserInputObjectType = z.infer<typeof UserInputObjectSchema>;

// Schema principal de entrada do caso de uso
export const CreateUserUseCaseInputSchema = z.object({
    user: UserInputObjectSchema,
    llmProviderConfigId: z.string().uuid("LLM Provider Config ID must be a valid UUID."),
});
export type CreateUserUseCaseInput = z.infer<typeof CreateUserUseCaseInputSchema>;

// Schema de saída do caso de uso
export const CreateUserUseCaseOutputSchema = z.object({
    userId: z.string().uuid(), // Assumindo que UserId será um UUID string
});
export type CreateUserUseCaseOutput = z.infer<typeof CreateUserUseCaseOutputSchema>;
