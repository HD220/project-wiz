#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Configurações baseadas nos padrões do projeto
const TEST_FOLDER_STRUCTURE = {
  unit: "Testes de unidade",
  integration: "Testes de integração",
  e2e: "Testes end-to-end",
  stress: "Testes de stress",
  setup: "Configurações de teste",
  lib: "Bibliotecas de teste",
};

const REQUIRED_FILES = ["setup.ts", "setup/drizzle.ts"];

const FILE_NAME_PATTERN = /\.test\.ts$/;
const EXCLUDED_FILES = [
  "setup.ts",
  "setup/drizzle.ts",
  "lib/base-test.ts", // Arquivo utilitário, não é um teste
  "setup/drizzle.ts", // Arquivo de configuração do Drizzle
];

class TestStructureValidator {
  constructor() {
    this.report = {
      passed: 0,
      failed: 0,
      errors: [],
      warnings: [],
      details: {},
    };
  }

  validate() {
    try {
      this.validateFolderStructure();
      this.validateRequiredFiles();
      this.validateTestFilesNaming();
      this.validateTestImports();
      this.generateReport();
    } catch (error) {
      this.addError(`Erro durante a validação: ${error.message}`);
      this.generateReport();
      process.exit(1);
    }
  }

  validateFolderStructure() {
    const testFolders = fs.readdirSync(path.join(process.cwd(), "tests"));

    // Verifica pastas obrigatórias
    Object.keys(TEST_FOLDER_STRUCTURE).forEach((folder) => {
      if (!testFolders.includes(folder)) {
        this.addError(
          `Pasta de testes ausente: ${folder} (${TEST_FOLDER_STRUCTURE[folder]})`
        );
      } else {
        this.addSuccess(`Pasta de testes encontrada: ${folder}`);
      }
    });

    // Verifica pastas adicionais não especificadas
    testFolders.forEach((folder) => {
      if (
        !TEST_FOLDER_STRUCTURE[folder] &&
        fs.statSync(path.join(process.cwd(), "tests", folder)).isDirectory()
      ) {
        this.addWarning(`Pasta não especificada nos padrões: ${folder}`);
      }
    });
  }

  validateRequiredFiles() {
    REQUIRED_FILES.forEach((file) => {
      const filePath = path.join(process.cwd(), "tests", file);
      if (!fs.existsSync(filePath)) {
        this.addError(`Arquivo obrigatório ausente: ${file}`);
      } else {
        this.addSuccess(`Arquivo obrigatório encontrado: ${file}`);

        // Verificação adicional para setup.ts
        if (file === "setup.ts") {
          const content = fs.readFileSync(filePath, "utf8");
          if (!content.includes("setupTestDB")) {
            this.addWarning(
              `setup.ts pode não estar configurado corretamente (setupTestDB não encontrado)`
            );
          }
        }
      }
    });
  }

  validateTestFilesNaming() {
    this.walkDirectory(path.join(process.cwd(), "tests"), (filePath) => {
      const relativePath = path.relative(process.cwd(), filePath);

      // Verifica se o arquivo deve ser completamente ignorado
      const shouldSkip = EXCLUDED_FILES.some((excluded) =>
        relativePath.replace(/\\/g, "/").includes(excluded)
      );

      if (filePath.endsWith(".ts") && !shouldSkip) {
        const isValid = FILE_NAME_PATTERN.test(filePath);

        if (!isValid) {
          this.addError(
            `Nome de arquivo inválido: ${relativePath} (deve terminar com .test.ts)`
          );
        } else {
          this.addSuccess(`Nome de arquivo válido: ${relativePath}`);
        }
      }
    });
  }

  validateTestImports() {
    this.walkDirectory(path.join(process.cwd(), "tests"), (filePath) => {
      if (filePath.endsWith(".test.ts")) {
        try {
          const content = fs.readFileSync(filePath, "utf8");

          // Verifica imports do vitest
          if (!content.includes("vitest") && !content.includes("describe")) {
            this.addWarning(
              `Arquivo de teste pode não estar usando Vitest: ${path.relative(process.cwd(), filePath)}`
            );
          }

          // Verifica imports do Drizzle para testes de integração
          if (
            filePath.includes("integration") &&
            !content.includes("drizzle") &&
            !content.includes("Drizzle")
          ) {
            // Verifica se é um teste que não deveria usar Drizzle (loggers, etc)
            const excludedPatterns = [
              /services\/logger/, // Testes de logger
              /unit\/.*\/.*\.entity/, // Testes de entidades
            ];

            if (!excludedPatterns.some((pattern) => pattern.test(filePath))) {
              this.addWarning(
                `Teste de integração pode não estar usando Drizzle: ${path.relative(process.cwd(), filePath)}`
              );
            }
          }
        } catch (error) {
          this.addError(`Erro ao ler arquivo ${filePath}: ${error.message}`);
        }
      }
    });
  }

  walkDirectory(dir, callback) {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        this.walkDirectory(filePath, callback);
      } else if (stat.isFile()) {
        callback(filePath);
      }
    });
  }

  addSuccess(message) {
    this.report.passed++;
    this.addDetail("success", message);
  }

  addWarning(message) {
    this.report.warnings.push(message);
    this.addDetail("warning", message);
  }

  addError(message) {
    this.report.failed++;
    this.report.errors.push(message);
    this.addDetail("error", message);
  }

  addDetail(type, message) {
    if (!this.report.details[type]) {
      this.report.details[type] = [];
    }
    this.report.details[type].push(message);
  }

  generateReport() {
    const totalChecks = this.report.passed + this.report.failed;
    console.log("\n=== Relatório de Verificação de Estrutura de Testes ===\n");
    console.log(`📊 Total de verificações: ${totalChecks}`);

    // Resumo
    console.log(
      `✅ ${this.report.passed} verificações passaram (${Math.round((this.report.passed / totalChecks) * 100)}%)`
    );
    console.log(
      `❌ ${this.report.failed} verificações falharam (${Math.round((this.report.failed / totalChecks) * 100)}%)`
    );
    console.log(`⚠️  ${this.report.warnings.length} avisos\n`);

    // Sugestões para correções
    if (this.report.failed > 0 || this.report.warnings.length > 0) {
      console.log("💡 Sugestões de correção:");
      this.report.errors.concat(this.report.warnings).forEach((issue, i) => {
        let suggestion = "";
        if (issue.includes("Nome de arquivo inválido")) {
          suggestion = "Renomeie o arquivo para terminar com .test.ts";
        } else if (issue.includes("não estar usando Drizzle")) {
          suggestion =
            "Verifique se é um teste que realmente deveria usar Drizzle";
        }
        if (suggestion) {
          console.log(` ${i + 1}. Para "${issue}": ${suggestion}`);
        }
      });
    }

    // Detalhes
    if (this.report.errors.length > 0) {
      console.log("Erros encontrados:");
      this.report.errors.forEach((error, i) =>
        console.log(` ${i + 1}. ${error}`)
      );
    }

    if (this.report.warnings.length > 0) {
      console.log("\nAvisos:");
      this.report.warnings.forEach((warning, i) =>
        console.log(` ${i + 1}. ${warning}`)
      );
    }

    // Resultado final
    console.log("\n=== Resultado ===");
    if (this.report.failed > 0) {
      console.log("❌ A estrutura de testes não está conforme os padrões");
      process.exit(1);
    } else {
      console.log("✅ Estrutura de testes está conforme os padrões");
    }
  }
}

// Executa a validação
new TestStructureValidator().validate();
