import { z } from "zod";
import { sessionRegistry } from "@/main/services/session-registry";

// Output validation schema
const IsLoggedInOutputSchema = z.object({
  isLoggedIn: z.boolean(),
});

type IsLoggedInOutput = z.infer<typeof IsLoggedInOutputSchema>;

export default async function(): Promise<IsLoggedInOutput> {
  // Use session registry directly - no database access needed
  const isLoggedIn = sessionRegistry.isLoggedIn();
  
  return IsLoggedInOutputSchema.parse({ isLoggedIn });
}

declare global {
  namespace WindowAPI {
    interface Auth {
      isLoggedIn: () => Promise<IsLoggedInOutput>
    }
  }
}