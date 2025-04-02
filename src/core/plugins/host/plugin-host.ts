import { Plugin, PluginConfig } from "../types.js";
import { ServiceRegistry } from "../registry/service-registry.js";

export class PluginHost {
  private plugins: Map<string, Plugin> = new Map();
  private registry: ServiceRegistry = new ServiceRegistry();

  async loadPlugin(plugin: Plugin, config: PluginConfig): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already loaded`);
    }

    try {
      // Initialize plugin
      await plugin.init(config);

      // Register plugin services
      await this.registry.registerPluginServices(plugin);

      // Store plugin reference
      this.plugins.set(plugin.name, plugin);
    } catch (error) {
      if (plugin.onError) {
        plugin.onError(error as Error);
      }
      throw error;
    }
  }

  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) return;

    try {
      await plugin.teardown();
      this.plugins.delete(name);
    } catch (error) {
      if (plugin.onError) {
        plugin.onError(error as Error);
      }
      throw error;
    }
  }

  async execute(
    pluginName: string,
    method: string,
    params: unknown
  ): Promise<unknown> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }
    return plugin.execute(method, params);
  }

  getRegistry(): ServiceRegistry {
    return this.registry;
  }
}
