export interface PluginConfig {
  permissions?: string[];
  dependencies?: {
    required: string[];
    optional: string[];
  };
  [key: string]: unknown;
}

export interface Plugin {
  name: string;
  version: string;
  description?: string;
  init(config: PluginConfig): Promise<void>;
  register(registry: ServiceRegistry): Promise<void>;
  execute(method: string, params: unknown): Promise<unknown>;
  teardown(): Promise<void>;
  onError?(error: Error): void;
}

export interface ServiceRegistry {
  getService<T>(name: string): T | undefined;
  registerService(name: string, service: unknown): void;
  requireService<T>(name: string): T;
  unregisterService(name: string): boolean;
  registerPluginServices(plugin: Plugin): Promise<void>;
}
