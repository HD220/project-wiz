import { z } from "zod";
import { getMainWindow } from "@/main/services/window-registry";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const MaximizeWindowInputSchema = z.void();
const MaximizeWindowOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: MaximizeWindowInputSchema,
  outputSchema: MaximizeWindowOutputSchema,
  handler: async () => {
    const mainWindow = getMainWindow();
    
    if (!mainWindow) {
      throw new Error("No main window found");
    }

    mainWindow.maximize();
    return undefined;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Window {
      maximize: InferHandler<typeof handler>
    }
  }
}