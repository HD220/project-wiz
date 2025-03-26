import LlamaCore from "./LlamaCore";
import ChatWorker from "./ChatWorker.js";
import AnalysisWorker from "./AnalysisWorker.js";

type WorkerType = "chat" | "analysis" | "documentation" | "coding";

export default class LlamaWorkerFactory {
  static createWorker(type: WorkerType): LlamaCore {
    switch (type) {
      case "chat":
        return new ChatWorker();
      case "analysis":
        return new AnalysisWorker();
      case "documentation":
        // Implementar DocumentationWorker posteriormente
        throw new Error("Documentation worker not implemented yet");
      case "coding":
        // Implementar CodingWorker posteriormente
        throw new Error("Coding worker not implemented yet");
      default:
        throw new Error(`Unknown worker type: ${type}`);
    }
  }
}
