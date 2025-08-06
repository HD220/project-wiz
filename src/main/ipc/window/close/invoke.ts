import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const CloseWindowInputSchema = z.void();
const CloseWindowOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: CloseWindowInputSchema,
  outputSchema: CloseWindowOutputSchema,
  handler: async () => {
    const mainWindow = getMainWindow();
    
    if (!mainWindow) {
      throw new Error("No main window found");
    }

    mainWindow.close();
    return undefined;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Window {
      close: InferHandler<typeof handler>
    }
  }
}