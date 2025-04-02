import { parentPort } from "worker_threads";
import type { Plugin, PluginConfig } from "../types.js";

if (!parentPort) {
  throw new Error("Worker must be run as a worker thread");
}

let pluginInstance: Plugin | null = null;

parentPort.on("message", async (message: unknown) => {
  try {
    if (typeof message !== "object" || message === null) {
      throw new Error("Invalid message format");
    }

    const { type, payload } = message as { type: string; payload: unknown };

    switch (type) {
      case "init": {
        if (!payload || typeof payload !== "object") {
          throw new Error("Invalid init payload");
        }
        const { plugin, config } = payload as {
          plugin: new () => Plugin;
          config: PluginConfig;
        };
        const instance = new plugin();
        await instance.init(config);
        pluginInstance = instance;
        parentPort?.postMessage({ success: true });
        break;
      }

      case "execute": {
        if (!pluginInstance) {
          throw new Error("Plugin not initialized");
        }
        if (!payload || typeof payload !== "object") {
          throw new Error("Invalid execute payload");
        }
        const { method, params } = payload as {
          method: string;
          params: unknown;
        };
        const result = await pluginInstance.execute(method, params);
        parentPort?.postMessage({ success: true, result });
        break;
      }

      case "teardown": {
        if (pluginInstance) {
          await pluginInstance.teardown();
          pluginInstance = null;
        }
        parentPort?.postMessage({ success: true });
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    parentPort?.postMessage({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
