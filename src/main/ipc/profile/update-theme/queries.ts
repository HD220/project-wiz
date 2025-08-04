import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import {
  userPreferencesTable,
  type Theme,
} from "@/main/database/schemas/user-preferences.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const UpdateThemeInputSchema = z.object({
  theme: z.enum(["light", "dark", "system"])
});

// Output validation schema
export const UpdateThemeOutputSchema = z.object({
  theme: z.enum(["light", "dark", "system"])
});

export type UpdateThemeInput = z.infer<typeof UpdateThemeInputSchema>;
export type UpdateThemeOutput = z.infer<typeof UpdateThemeOutputSchema>;

export async function updateTheme(userId: string, input: UpdateThemeInput): Promise<UpdateThemeOutput> {
  const db = getDatabase();
  
  const validatedInput = UpdateThemeInputSchema.parse(input);

  await db
    .update(userPreferencesTable)
    .set({ 
      theme: validatedInput.theme, 
      updatedAt: new Date() 
    })
    .where(eq(userPreferencesTable.userId, userId));

  return UpdateThemeOutputSchema.parse({ theme: validatedInput.theme });
}