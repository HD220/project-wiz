import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";

// Output validation schema
const MinimizeWindowOutputSchema = z.void();

type MinimizeWindowOutput = z.infer<typeof MinimizeWindowOutputSchema>;

export default async function(): Promise<MinimizeWindowOutput> {
  const mainWindow = getMainWindow();
  
  if (!mainWindow) {
    throw new Error("No main window found");
  }

  mainWindow.minimize();
  return undefined;
}

declare global {
  namespace WindowAPI {
    interface Window {
      minimize: () => Promise<MinimizeWindowOutput>
    }
  }
}