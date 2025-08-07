import { z } from "zod";

import { getMainWindow } from "@/main/services/window-registry";

import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const MinimizeWindowInputSchema = z.void();
const MinimizeWindowOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: MinimizeWindowInputSchema,
  outputSchema: MinimizeWindowOutputSchema,
  handler: async () => {
    const mainWindow = getMainWindow();

    if (!mainWindow) {
      throw new Error("No main window found");
    }

    mainWindow.minimize();
    return undefined;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Window {
      minimize: InferHandler<typeof handler>;
    }
  }
}
