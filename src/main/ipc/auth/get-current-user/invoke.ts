import { z } from "zod";
import { sessionRegistry } from "@/main/utils/session-registry";

// Output validation schema baseado em AuthenticatedUser (que é Omit<SelectUser, "passwordHash">)
const GetCurrentUserOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.enum(["human", "agent"]),
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).nullable();

type GetCurrentUserOutput = z.infer<typeof GetCurrentUserOutputSchema>;

export default async function(): Promise<GetCurrentUserOutput> {
  // Simply return from session registry cache - no database access needed
  const currentUser = sessionRegistry.getCurrentUser();
  
  return GetCurrentUserOutputSchema.parse(currentUser);
}

declare global {
  namespace WindowAPI {
    interface Auth {
      getCurrentUser: () => Promise<GetCurrentUserOutput>
    }
  }
}