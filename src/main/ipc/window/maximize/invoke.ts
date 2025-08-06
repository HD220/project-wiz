import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";

// Input validation schema (sem parâmetros)
const MaximizeWindowInputSchema = z.void();

// Output validation schema
const MaximizeWindowOutputSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

type MaximizeWindowInput = z.infer<typeof MaximizeWindowInputSchema>;
type MaximizeWindowOutput = z.infer<typeof MaximizeWindowOutputSchema>;

export default async function(input: MaximizeWindowInput): Promise<MaximizeWindowOutput> {
  const mainWindow = getMainWindow();
  
  if (!mainWindow) {
    throw new Error("No main window found");
  }

  mainWindow.maximize();

  return MaximizeWindowOutputSchema.parse({
    success: true,
    message: "Window maximized successfully"
  });
}

declare global {
  namespace WindowAPI {
    interface Window {
      maximize: () => Promise<MaximizeWindowOutput>
    }
  }
}