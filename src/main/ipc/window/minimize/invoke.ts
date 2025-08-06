import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";

// Input validation schema (sem parâmetros)
const MinimizeWindowInputSchema = z.void();

// Output validation schema
const MinimizeWindowOutputSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

type MinimizeWindowInput = z.infer<typeof MinimizeWindowInputSchema>;
type MinimizeWindowOutput = z.infer<typeof MinimizeWindowOutputSchema>;

export default async function(input: MinimizeWindowInput): Promise<MinimizeWindowOutput> {
  const mainWindow = getMainWindow();
  
  if (!mainWindow) {
    throw new Error("No main window found");
  }

  mainWindow.minimize();

  return MinimizeWindowOutputSchema.parse({
    success: true,
    message: "Window minimized successfully"
  });
}

declare global {
  namespace WindowAPI {
    interface Window {
      minimize: () => Promise<MinimizeWindowOutput>
    }
  }
}