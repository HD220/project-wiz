import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";

// Output validation schema
const CloseWindowOutputSchema = z.void();

type CloseWindowOutput = z.infer<typeof CloseWindowOutputSchema>;

export default async function(): Promise<CloseWindowOutput> {
  const mainWindow = getMainWindow();
  
  if (!mainWindow) {
    throw new Error("No main window found");
  }

  mainWindow.close();
  return undefined;
}

declare global {
  namespace WindowAPI {
    interface Window {
      close: () => Promise<CloseWindowOutput>
    }
  }
}