import { Plugin } from "../../../src/core/plugins/types.js";

export default class BasicPlugin implements Plugin {
  private counter = 0;

  name = "basic-example";
  version = "1.0.0";
  description = "Demonstrates basic plugin functionality";

  async init() {
    console.log("BasicPlugin initialized");
  }

  async register(registry) {
    registry.registerService("basic-service", {
      increment: () => ++this.counter,
      getCount: () => this.counter,
    });
  }

  async execute(method: string, params: any) {
    switch (method) {
      case "greet":
        return `Hello, ${params.name || "World"}!`;
      case "calculate":
        return params.a + params.b;
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  async teardown() {
    console.log("BasicPlugin teardown");
  }

  onError(error: Error) {
    console.error("BasicPlugin error:", error.message);
  }
}
