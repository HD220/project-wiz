import { defineConfig } from "vitest/config";
import path from "path";
import viteTsconfigPaths from 'vite-tsconfig-paths'; // Uncommented

export default defineConfig({
  plugins: [viteTsconfigPaths()], // Uncommented
  test: {
    globals: true,
    environment: "node",
    setupFiles: [path.resolve(__dirname, "./tests/test-setup.ts")],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src_refactored/**/*.ts", "vite.*.mts"],
    },
  },
  // resolve: { // Manual alias section commented out
  //   alias: [
  //     // Specific aliases for '@/refactored/...' directory first, ordered from most specific to most general
  //     { find: "@/refactored/shared/result", replacement: path.resolve(__dirname, "./src_refactored/shared/result.ts") },
  //     { find: "@/refactored/core/domain/agent/agent.entity", replacement: path.resolve(__dirname, "./src_refactored/core/domain/agent/agent.entity.ts") },
  //     { find: "@/refactored/core/domain/agent/ports/i-agent-internal-state.repository", replacement: path.resolve(__dirname, "./src_refactored/core/domain/agent/ports/i-agent-internal-state.repository.ts") },
  //     { find: "@/refactored/core/domain/job/job.entity", replacement: path.resolve(__dirname, "./src_refactored/core/domain/job/job.entity.ts") },
  //     { find: "@/refactored/core/domain/job/job-processing.types", replacement: path.resolve(__dirname, "./src_refactored/core/domain/job/job-processing.types.ts") },
  //     { find: "@/refactored/core/domain/job/ports/i-job.repository", replacement: path.resolve(__dirname, "./src_refactored/core/domain/job/ports/i-job.repository.ts") },
  //     { find: "@/refactored/core/common/errors", replacement: path.resolve(__dirname, "./src_refactored/core/common/errors.ts") },
  //     { find: "@/refactored/core/application/common/errors", replacement: path.resolve(__dirname, "./src_refactored/core/application/common/errors.ts") },
  //     { find: "@/refactored/core/application/ports/services/i-agent-executor.interface", replacement: path.resolve(__dirname, "./src_refactored/core/application/ports/services/i-agent-executor.interface.ts") },
  //     { find: "@/refactored/core/application/ports/adapters/i-llm.adapter", replacement: path.resolve(__dirname, "./src_refactored/core/application/ports/adapters/i-llm.adapter.ts") },
  //     { find: "@/refactored/core/application/ports/services/i-tool-registry.service", replacement: path.resolve(__dirname, "./src_refactored/core/application/ports/services/i-tool-registry.service.ts") },
  //     { find: "@/refactored/core/common/services/i-logger.service", replacement: path.resolve(__dirname, "./src_refactored/core/common/services/i-logger.service.ts") },

  //     // General directory aliases for '@/refactored/...'
  //     { find: "@/refactored/shared", replacement: path.resolve(__dirname, "./src_refactored/shared") },
  //     { find: "@/refactored/core/application/ports/services", replacement: path.resolve(__dirname, "./src_refactored/core/application/ports/services") },
  //     { find: "@/refactored/core/application/ports/adapters", replacement: path.resolve(__dirname, "./src_refactored/core/application/ports/adapters") },
  //     { find: "@/refactored/core/application/common", replacement: path.resolve(__dirname, "./src_refactored/core/application/common") },
  //     { find: "@/refactored/core/domain/agent/ports", replacement: path.resolve(__dirname, "./src_refactored/core/domain/agent/ports") },
  //     { find: "@/refactored/core/domain/agent", replacement: path.resolve(__dirname, "./src_refactored/core/domain/agent") },
  //     { find: "@/refactored/core/domain/job/ports", replacement: path.resolve(__dirname, "./src_refactored/core/domain/job/ports") },
  //     { find: "@/refactored/core/domain/job", replacement: path.resolve(__dirname, "./src_refactored/core/domain/job") },
  //     { find: "@/refactored/core/common", replacement: path.resolve(__dirname, "./src_refactored/core/common") },
  //     { find: "@/refactored/core", replacement: path.resolve(__dirname, "./src_refactored/core") },
  //     { find: "@/refactored", replacement: path.resolve(__dirname, "./src_refactored") }, // This is essentially '@/refactored/'

  //     // Aliases for original 'src' directory. The most general '@/' should be last among these.
  //     { find: "@/components", replacement: path.resolve(__dirname, "./src/infrastructure/frameworks/react/components") },
  //     { find: "@/lib", replacement: path.resolve(__dirname, "./src/infrastructure/frameworks/react/lib") },
  //     { find: "@/hooks", replacement: path.resolve(__dirname, "./src/infrastructure/frameworks/react/hooks") },
  //     { find: "@/ui", replacement: path.resolve(__dirname, "./src/infrastructure/frameworks/react/components/ui") },
  //     { find: "@/application", replacement: path.resolve(__dirname, "./src/core/application") },
  //     { find: "@/core", replacement: path.resolve(__dirname, "./src/core") }, // Points to ./src/core
  //     { find: "@/shared", replacement: path.resolve(__dirname, "./src/shared") }, // Points to ./src/shared
  //     { find: "@/", replacement: path.resolve(__dirname, "./src/") }, // General alias for ./src
  //   ],
  // },
});
