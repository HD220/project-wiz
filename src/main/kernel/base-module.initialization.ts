export class ModuleInitialization {
  initialized = false;

  async initializeOnce(initializeFn: () => Promise<void>): Promise<void> {
    if (this.initialized) {
      return;
    }

    await initializeFn();
    this.initialized = true;
  }

  requireInitialized(moduleName: string): void {
    if (!this.initialized) {
      throw new Error(
        `Module ${moduleName} must be initialized before registering IPC handlers`,
      );
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
