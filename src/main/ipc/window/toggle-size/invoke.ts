import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";

// Input validation schema (sem parâmetros)
const ToggleSizeWindowInputSchema = z.void();

// Output validation schema
const ToggleSizeWindowOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  isMaximized: z.boolean()
});

type ToggleSizeWindowInput = z.infer<typeof ToggleSizeWindowInputSchema>;
type ToggleSizeWindowOutput = z.infer<typeof ToggleSizeWindowOutputSchema>;

export default async function(input: ToggleSizeWindowInput): Promise<ToggleSizeWindowOutput> {
  const mainWindow = getMainWindow();
  
  if (!mainWindow) {
    throw new Error("No main window found");
  }

  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
    return ToggleSizeWindowOutputSchema.parse({
      success: true,
      message: "Window restored to normal size",
      isMaximized: false
    });
  } else {
    mainWindow.maximize();
    return ToggleSizeWindowOutputSchema.parse({
      success: true,
      message: "Window maximized to full size",
      isMaximized: true
    });
  }
}

declare global {
  namespace WindowAPI {
    interface Window {
      toggleSize: (input: ToggleSizeWindowInput) => Promise<ToggleSizeWindowOutput>
    }
  }
}