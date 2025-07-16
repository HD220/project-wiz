import { IModule } from "./interfaces/module.interface";

export class TopologicalSort {
  constructor(private modules: Map<string, IModule>) {}

  sort(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) return;

      const module = this.modules.get(name);
      if (!module) return;

      visited.add(name);

      for (const dep of module.getDependencies()) {
        visit(dep);
      }

      result.push(name);
    };

    for (const [name] of this.modules) {
      visit(name);
    }

    return result;
  }
}
