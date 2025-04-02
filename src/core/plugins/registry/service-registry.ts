import { Plugin, ServiceRegistry as IServiceRegistry } from "../types.js";

export class ServiceRegistry implements IServiceRegistry {
  private services: Map<string, unknown> = new Map();

  getService<T>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  requireService<T>(name: string): T {
    const service = this.getService<T>(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }

  registerService(name: string, service: unknown): void {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} already registered`);
    }
    this.services.set(name, service);
  }

  unregisterService(name: string): boolean {
    return this.services.delete(name);
  }

  async registerPluginServices(plugin: Plugin): Promise<void> {
    await plugin.register(this);
  }
}
