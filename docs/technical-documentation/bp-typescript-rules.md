> **Nota:** Este documento foi originado de `.roo/rules/` e contém diretrizes de desenvolvimento relevantes para o Project Wiz.

# **TypeScript Best Practices**

This rule set guides the AI to adhere to fundamental TypeScript best practices, ensuring robust type safety, clear interface definitions, and modern module usage.

## **Context**

This rule applies to all TypeScript (.ts) and TSX (.tsx) files within the project. It should be automatically attached when working with these file types.

## **Requirements**

* **Type Safety Enforcement:** Explicitly define types for all variables, function arguments, and return values. Avoid any unless absolutely necessary and justified with a comment.
* **Interface/Type Definition:** Use interface or type for object shapes and complex types. Organize these definitions in dedicated types or interfaces files/folders.
* **Readonly Properties:** Apply readonly to properties that should not be reassigned after initialization in interfaces, types, and classes.
* **Enums vs. Union Types:** Prefer union types ('value1' | 'value2') for simple literal sets. Use enum for distinct sets of related constants with symbolic names.
* **Generics for Reusability:** Employ generics to create reusable components and functions that maintain type safety across different types.
* **Null and Undefined Handling:** Explicitly handle null or undefined values using optional chaining (?.), nullish coalescing (??), or type guards.
* **ESM Modules:** Always prefer ES module syntax (import/export) for module definitions and imports.
* **Strict Compiler Options:** Assume strict TypeScript compiler options (e.g., strict: true, noImplicitAny: true, strictNullChecks: true) are enabled and write code compatible with them.

## **Examples**

<example type="valid">
TypeScript

type User = {
  readonly id: string;
  name: string;
  email?: string;
}

type UserRole = 'admin' | 'editor' | 'viewer';

function getUserById(id: string): User | undefined {
  //... logic
  return { id: '123', name: 'John Doe' };
}

const role: UserRole = 'admin';
</example>
<example type="invalid">
TypeScript

function processData(data: any) { // Avoid 'any'
  //...
}

class Config {
  value: string; // Should be readonly if not re-assigned
}

enum Status { // Prefer union for simple strings
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

let user: { name: string }; // Use interface/type alias
</example>
