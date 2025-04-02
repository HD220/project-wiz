import type { Plugin } from "../../../src/core/plugins/types.js";

export default class HelloWorldPlugin implements Plugin {
  name = "hello-world";
  version = "1.0.0";
  description = "A simple hello world plugin";

  async init() {
    console.log("HelloWorldPlugin initialized");
  }

  async register(registry) {
    registry.registerService("greeter", {
      sayHello: (name: string) => `Hello, ${name}!`,
    });
  }

  async execute(method: string, params: unknown) {
    switch (method) {
      case "greet":
        return `Hello, ${params}!`;
      default:
        throw new Error(`Method ${method} not supported`);
    }
  }

  async teardown() {
    console.log("HelloWorldPlugin teardown");
  }
}
