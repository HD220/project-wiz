import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";

// Output validation schema
const MaximizeWindowOutputSchema = z.void();

type MaximizeWindowOutput = z.infer<typeof MaximizeWindowOutputSchema>;

export default async function(): Promise<MaximizeWindowOutput> {
  const mainWindow = getMainWindow();
  
  if (!mainWindow) {
    throw new Error("No main window found");
  }

  mainWindow.maximize();
  return undefined;
}

declare global {
  namespace WindowAPI {
    interface Window {
      maximize: () => Promise<MaximizeWindowOutput>
    }
  }
}