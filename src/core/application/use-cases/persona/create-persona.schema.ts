import { z } from 'zod';

export const CreatePersonaInputSchema = z.object({
    name: z.string().min(1, "Persona name cannot be empty."),
    role: z.string().min(1, "Persona role cannot be empty."),
    goal: z.string().min(1, "Persona goal cannot be empty."),
    backstory: z.string().min(1, "Persona backstory cannot be empty."),
    // temperature: z.number().min(0).max(2).optional(), // Example if temperature was part of input
});

export type CreatePersonaUseCaseInput = z.infer<typeof CreatePersonaInputSchema>;

export const CreatePersonaOutputSchema = z.object({
    personaId: z.string().uuid(), // Assuming PersonaId will be a UUID string
});

export type CreatePersonaUseCaseOutput = z.infer<typeof CreatePersonaOutputSchema>;
