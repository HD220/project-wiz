import { Sandbox } from "../src/core/plugins/sandbox/sandbox.js";
import BasicPlugin from "./plugins/basic-example/plugin.js";

/**
 * Demonstração de uso do plugin básico
 *
 * Este exemplo mostra:
 * 1. Como inicializar um plugin
 * 2. Como chamar métodos do plugin
 * 3. Tratamento de erros
 * 4. Funcionamento do timeout
 */
async function testBasicPlugin() {
  const sandbox = new Sandbox();

  try {
    // 1. Inicialização
    console.log("Initializing plugin...");
    await sandbox.init(BasicPlugin, {});

    // 2. Chamada de métodos
    console.log("\nTesting methods:");
    const greeting = await sandbox.execute<string>("greet", {
      name: "Plugin User",
    });
    console.log("Greeting result:", greeting);

    const sum = await sandbox.execute<number>("calculate", { a: 5, b: 3 });
    console.log("Calculation result:", sum);

    // 3. Tratamento de erros
    console.log("\nTesting error handling:");
    try {
      await sandbox.execute("unknownMethod", {});
    } catch (error) {
      console.log(
        "Caught expected error:",
        error instanceof Error ? error.message : String(error)
      );
    }

    // 4. Teste de timeout
    console.log("\nTesting timeout:");
    try {
      await sandbox.execute("longRunningMethod", {});
    } catch (error) {
      console.log(
        "Timeout triggered:",
        error instanceof Error && error.message.includes("timed out")
      );
    }
  } finally {
    // Limpeza
    await sandbox.teardown();
    console.log("\nPlugin teardown completed");
  }
}

// Executa a demonstração
testBasicPlugin()
  .then(() => console.log("\nTest completed successfully"))
  .catch((err) => console.error("Test failed:", err));
