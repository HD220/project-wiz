import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";

// Input validation schema (sem parâmetros)
const CloseWindowInputSchema = z.void();

// Output validation schema
const CloseWindowOutputSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

type CloseWindowInput = z.infer<typeof CloseWindowInputSchema>;
type CloseWindowOutput = z.infer<typeof CloseWindowOutputSchema>;

export default async function(input: CloseWindowInput): Promise<CloseWindowOutput> {
  const mainWindow = getMainWindow();
  
  if (!mainWindow) {
    throw new Error("No main window found");
  }

  mainWindow.close();

  return CloseWindowOutputSchema.parse({
    success: true,
    message: "Window closed successfully"
  });
}

declare global {
  namespace WindowAPI {
    interface Window {
      close: () => Promise<CloseWindowOutput>
    }
  }
}