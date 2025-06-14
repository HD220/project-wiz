import "reflect-metadata";
import { vi } from "vitest";

// Configurações globais para os testes
vi.mock("better-sqlite3", () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    prepare: vi.fn().mockReturnThis(),
    run: vi.fn(),
    get: vi.fn(),
    all: vi.fn(),
    exec: vi.fn(),
    pragma: vi.fn(),
  })),
}));

// Configuração do console para testes
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});
