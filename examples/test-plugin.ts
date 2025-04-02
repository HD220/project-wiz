import { PluginHost } from "../src/core/plugins/host/plugin-host.js";
import HelloWorldPlugin from "./plugins/hello-world/plugin.js";

async function testPluginSystem() {
  const host = new PluginHost();

  try {
    // Carregar o plugin
    await host.loadPlugin(new HelloWorldPlugin(), {});

    // Executar método diretamente
    const result = await host.execute("hello-world", "greet", "World");
    console.log("Plugin execution result:", result);

    // Acessar serviço registrado
    const registry = host.getRegistry();
    const greeter = registry.getService<{ sayHello: (name: string) => string }>(
      "greeter"
    );
    if (greeter) {
      console.log("Service call:", greeter.sayHello("Plugin System"));
    }

    // Descarregar o plugin
    await host.unloadPlugin("hello-world");
  } catch (error) {
    console.error("Plugin system error:", error);
  }
}

testPluginSystem();
