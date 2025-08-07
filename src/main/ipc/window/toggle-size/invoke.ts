import { z } from "zod";

import { getMainWindow } from "@/main/services/window-registry";

import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const ToggleSizeWindowInputSchema = z.void();
const ToggleSizeWindowOutputSchema = z.object({
  isMaximized: z.boolean(),
});

const handler = createIPCHandler({
  inputSchema: ToggleSizeWindowInputSchema,
  outputSchema: ToggleSizeWindowOutputSchema,
  handler: async () => {
    const mainWindow = getMainWindow();

    if (!mainWindow) {
      throw new Error("No main window found");
    }

    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return {
        isMaximized: false,
      };
    }
    mainWindow.maximize();
    return {
      isMaximized: true,
    };
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Window {
      toggle: InferHandler<typeof handler>;
    }
  }
}
