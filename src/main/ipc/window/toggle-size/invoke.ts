import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";

// Output validation schema
const ToggleSizeWindowOutputSchema = z.object({
  isMaximized: z.boolean()
});

type ToggleSizeWindowOutput = z.infer<typeof ToggleSizeWindowOutputSchema>;

export default async function(): Promise<ToggleSizeWindowOutput> {
  const mainWindow = getMainWindow();
  
  if (!mainWindow) {
    throw new Error("No main window found");
  }

  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
    return ToggleSizeWindowOutputSchema.parse({
      isMaximized: false
    });
  } else {
    mainWindow.maximize();
    return ToggleSizeWindowOutputSchema.parse({
      isMaximized: true
    });
  }
}

declare global {
  namespace WindowAPI {
    interface Window {
      toggle: () => Promise<ToggleSizeWindowOutput>
    }
  }
}