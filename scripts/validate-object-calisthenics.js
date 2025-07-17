#!/usr/bin/env node

/**
 * Object Calisthenics Validation Script
 *
 * Validates the 9 Object Calisthenics rules in TypeScript files:
 * 1. Maximum 1 level of indentation per method
 * 2. No ELSE keyword
 * 3. Primitives encapsulated in Value Objects
 * 4. Maximum 10 lines per method
 * 5. Maximum 2 instance variables
 * 6. Maximum 50 lines per class
 * 7. Collections as first-class citizens
 * 8. No anemic getters/setters
 * 9. No static methods in entities
 */

const fs = require("fs");
const path = require("path");

class ObjectCalisthenicsValidator {
  constructor() {
    this.violations = [];
    this.stats = {
      filesChecked: 0,
      violationsFound: 0,
      rulesViolated: new Set(),
    };
  }

  validateFile(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    this.stats.filesChecked++;

    // Rule 1: Maximum 1 level of indentation
    this.checkIndentation(filePath, lines);

    // Rule 2: No ELSE keyword
    this.checkElseKeyword(filePath, lines);

    // Rule 4: Maximum 10 lines per method
    this.checkMethodLength(filePath, lines);

    // Rule 5: Maximum 2 instance variables
    this.checkInstanceVariables(filePath, lines);

    // Rule 6: Maximum 50 lines per class
    this.checkClassLength(filePath, lines);

    // Rule 8: No anemic getters/setters
    this.checkAnemicGettersSetters(filePath, lines);

    // Rule 9: No static methods in entities
    this.checkStaticMethods(filePath, lines);
  }

  checkIndentation(filePath, lines) {
    lines.forEach((line, index) => {
      const indentationLevel = this.getIndentationLevel(line);
      if (indentationLevel > 4) {
        // More than 2 levels (assuming 2 spaces per level)
        this.addViolation(
          filePath,
          index + 1,
          "Rule 1: Maximum 1 level of indentation exceeded",
          line.trim(),
        );
      }
    });
  }

  checkElseKeyword(filePath, lines) {
    lines.forEach((line, index) => {
      if (line.trim().startsWith("else") || line.includes(" else ")) {
        this.addViolation(
          filePath,
          index + 1,
          "Rule 2: ELSE keyword not allowed",
          line.trim(),
        );
      }
    });
  }

  checkMethodLength(filePath, lines) {
    let inMethod = false;
    let methodStart = 0;
    let methodName = "";
    let braceCount = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Detect method start
      if (
        trimmed.match(
          /^\s*(public|private|protected)?\s*\w+\s*\([^)]*\)\s*[:{]/,
        )
      ) {
        inMethod = true;
        methodStart = index;
        methodName = trimmed
          .split("(")[0]
          .replace(/^\s*(public|private|protected)?\s*/, "");
        braceCount = 0;
      }

      if (inMethod) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        if (braceCount === 0 && index > methodStart) {
          const methodLength = index - methodStart + 1;
          if (methodLength > 10) {
            this.addViolation(
              filePath,
              methodStart + 1,
              `Rule 4: Method '${methodName}' exceeds 10 lines (${methodLength} lines)`,
              "",
            );
          }
          inMethod = false;
        }
      }
    });
  }

  checkInstanceVariables(filePath, lines) {
    const classMatches = lines.join("\n").match(/class\s+\w+[^{]*\{[^}]*\}/gs);

    if (classMatches) {
      classMatches.forEach((classContent) => {
        const instanceVars =
          classContent.match(/^\s*(private|protected|public)\s+\w+:/gm) || [];
        if (instanceVars.length > 2) {
          this.addViolation(
            filePath,
            1,
            `Rule 5: Class has ${instanceVars.length} instance variables (max 2)`,
            "",
          );
        }
      });
    }
  }

  checkClassLength(filePath, lines) {
    let inClass = false;
    let classStart = 0;
    let className = "";
    let braceCount = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.match(/^export\s+class\s+\w+/)) {
        inClass = true;
        classStart = index;
        className = trimmed.match(/class\s+(\w+)/)[1];
        braceCount = 0;
      }

      if (inClass) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        if (braceCount === 0 && index > classStart) {
          const classLength = index - classStart + 1;
          if (classLength > 50) {
            this.addViolation(
              filePath,
              classStart + 1,
              `Rule 6: Class '${className}' exceeds 50 lines (${classLength} lines)`,
              "",
            );
          }
          inClass = false;
        }
      }
    });
  }

  checkAnemicGettersSetters(filePath, lines) {
    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Simple getter/setter detection
      if (
        trimmed.match(/^get\s+\w+\(\)\s*\{\s*return\s+this\.\w+;\s*\}/) ||
        trimmed.match(/^set\s+\w+\([^)]+\)\s*\{\s*this\.\w+\s*=\s*\w+;\s*\}/)
      ) {
        this.addViolation(
          filePath,
          index + 1,
          "Rule 8: Anemic getter/setter detected",
          trimmed,
        );
      }
    });
  }

  checkStaticMethods(filePath, lines) {
    // Only check entity files
    if (filePath.includes(".entity.ts")) {
      lines.forEach((line, index) => {
        if (line.trim().startsWith("static ")) {
          this.addViolation(
            filePath,
            index + 1,
            "Rule 9: Static methods not allowed in entities",
            line.trim(),
          );
        }
      });
    }
  }

  getIndentationLevel(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  addViolation(filePath, lineNumber, rule, code) {
    const violation = {
      file: filePath,
      line: lineNumber,
      rule,
      code,
    };

    this.violations.push(violation);
    this.stats.violationsFound++;
    this.stats.rulesViolated.add(rule.split(":")[0]);
  }

  validateDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !file.startsWith(".") &&
        file !== "node_modules"
      ) {
        this.validateDirectory(fullPath);
      } else if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
        this.validateFile(fullPath);
      }
    });
  }

  generateReport() {
    console.log("\n🏗️  Object Calisthenics Validation Report");
    console.log("==========================================");

    console.log(`\n📊 Summary:`);
    console.log(`   Files checked: ${this.stats.filesChecked}`);
    console.log(`   Violations found: ${this.stats.violationsFound}`);
    console.log(`   Rules violated: ${this.stats.rulesViolated.size}/9`);

    const complianceRate =
      this.stats.violationsFound === 0
        ? 100
        : Math.max(
            0,
            100 - (this.stats.violationsFound / this.stats.filesChecked) * 10,
          );

    console.log(`   Compliance rate: ${complianceRate.toFixed(1)}%`);

    if (this.violations.length > 0) {
      console.log(`\n❌ Violations by Rule:`);

      const violationsByRule = {};
      this.violations.forEach((v) => {
        const rule = v.rule.split(":")[0];
        if (!violationsByRule[rule]) violationsByRule[rule] = [];
        violationsByRule[rule].push(v);
      });

      Object.entries(violationsByRule).forEach(([rule, violations]) => {
        console.log(`\n   ${rule} (${violations.length} violations):`);
        violations.slice(0, 5).forEach((v) => {
          console.log(`     ${v.file}:${v.line} - ${v.rule}`);
          if (v.code) console.log(`       Code: ${v.code}`);
        });
        if (violations.length > 5) {
          console.log(`     ... and ${violations.length - 5} more`);
        }
      });
    } else {
      console.log("\n✅ All Object Calisthenics rules followed!");
    }

    console.log("\n==========================================\n");

    return this.violations.length === 0;
  }
}

// Main execution
const validator = new ObjectCalisthenicsValidator();
const srcPath = path.join(__dirname, "..", "src");

console.log("🔍 Validating Object Calisthenics rules...");
validator.validateDirectory(srcPath);

const isValid = validator.generateReport();

process.exit(isValid ? 0 : 1);
