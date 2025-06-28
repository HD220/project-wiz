# Best Development Practices and Guidelines - Project Wiz

This document consolidates various best practice guides and development rules relevant to working on Project Wiz. Adhering to these guidelines helps maintain code quality, consistency, and maintainability.

## General Development Rules (20 Most Common)

This rule set enforces general software development best practices applicable across various projects and technologies, promoting robust, readable, and maintainable code.

*   **DRY (Don't Repeat Yourself):** Eliminate code duplication. Abstract common logic into reusable functions, classes, or modules instead of copying and pasting.
*   **KISS (Keep It Simple, Stupid):** Design solutions that are as simple as possible but no simpler. Avoid unnecessary complexity.
*   **YAGNI (You Aren't Gonna Need It):** Implement only the functionality that is currently required. Avoid adding features or abstractions speculatively for future needs.
*   **Descriptive Naming:** Use clear, unambiguous, and descriptive names for variables, functions, classes, and files. Names should convey intent and purpose.
*   **Single Responsibility Principle (SRP):** Each module, class, or function should have one, and only one, reason to change. It should do one thing well.
*   **Fail Fast:** Detect errors as early as possible and exit gracefully. Validate inputs at the earliest opportunity to prevent propagation of invalid states.
*   **Consistent Formatting:** Adhere to a consistent code formatting style (e.g., Prettier, ESLint rules). Maintain uniform indentation, spacing, and bracket placement.
*   **Comprehensive Testing:** Write automated tests (unit, integration, end-to-end) for all critical paths and business logic. Aim for high test coverage.
*   **Idempotent Operations:** Design operations to be idempotent where applicable, meaning executing them multiple times has the same effect as executing them once.
*   **Immutable Data:** Prefer immutable data structures when possible. Avoid modifying objects or arrays in place; instead, create new instances with updated values.
*   **Meaningful Comments:** Write comments to explain *why* code exists, not *what* it does (unless the 'what' is complex). Document complex algorithms, tricky logic, or non-obvious choices.
*   **Version Control Discipline:** Commit small, atomic changes with clear and descriptive commit messages. Use feature branches and pull requests for collaboration.
*   **Dependency Management:** Manage project dependencies explicitly (e.g., package.json, requirements.txt). Keep dependencies updated and monitor for vulnerabilities.
*   **Error Handling:** Implement robust error handling mechanisms. Catch and log errors, provide meaningful error messages, and handle exceptions gracefully to prevent crashes.
*   **Performance Awareness:** Consider performance impacts of code choices. Optimize critical paths, reduce unnecessary computations, and minimize resource consumption.
*   **Security Best Practices:** Be mindful of security vulnerabilities. Sanitize all user inputs, avoid hardcoding sensitive information, and follow secure coding guidelines.
*   **Refactoring Regularly:** Continuously refactor code to improve its design, readability, and maintainability. Don't defer technical debt indefinitely.
*   **Avoid Magic Numbers/Strings:** Replace hardcoded numbers or strings with named constants or configuration variables to improve readability and maintainability.
*   **Loose Coupling, High Cohesion:** Design modules to be loosely coupled (minimize dependencies between them) and highly cohesive (elements within a module are functionally related).
*   **Code Reviews:** Participate in and conduct thorough code reviews to catch errors, share knowledge, and improve code quality.

### Examples (General Development Rules)

<example type="valid">
TypeScript

// Good: DRY, Descriptive Naming, SRP
function calculateTotalPrice(items: { price: number; quantity: number }[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Good: Fail Fast
function validateUserInput(input: string): void {
  if (!input || input.trim() === '') {
    throw new Error('Input cannot be empty.');
  }
}

// Good: Meaningful Comments
// Why: This regex ensures email format for user registration to prevent invalid data.
const EMAIL_REGEX = /^\[^\\s@\]+@\[^\\s@\]+\\.\[^\\s@\]+$/;
</example\>
<example type="invalid">
TypeScript

// Bad: Duplication (violates DRY)
function calculateOrderTotal(items: any[]): number {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

function calculateInvoiceTotal(products: any[]): number {
  let total = 0;
  for (const product of products) {
    total += product.price * product.quantity;
  }
  return total;
}

// Bad: Magic Number
// const TAX_RATE = 0.05; // Should be a named constant
// const finalPrice = price * (1 + 0.05);
</example\>

## Clean Architecture Principles

This rule set promotes strict adherence to Clean Architecture principles, ensuring the development of robust, testable, and scalable applications by defining clear layer responsibilities and dependency rules.

*   **Dependency Rule:** Strictly enforce the Dependency Rule: dependencies must always point inwards. Inner circles (Entities, Use Cases) must not know anything about outer circles (Adapters, Frameworks/Drivers).
*   **Layer Separation:** Maintain clear separation between the four main layers:
    *   **Entities:** Core business rules, data structures, and enterprise-wide business rules. Pure domain objects.
    *   **Use Cases (Interactors):** Application-specific business rules. Orchestrates the flow of data to and from entities.
    *   **Adapters (Controllers, Gateways, Presenters):** Convert data from inner layers to outer layers (and vice-versa). Bridges between use cases and external frameworks/drivers.
    *   **Frameworks & Drivers (Web, DB, UI):** The outermost layer, dealing with specific technologies and external systems.
*   **Inversion of Control (IoC):** Utilize the Dependency Inversion Principle. Inner layers define interfaces (abstractions), and outer layers implement them. Dependencies are injected from the outside in.
*   **Testability:** Prioritize testability. Each layer, especially Entities and Use Cases, should be independently testable without reliance on external frameworks or databases.
*   **No Direct Framework Imports in Core:** The core business logic (Entities, Use Cases) must have zero direct imports or dependencies on any external framework (e.g., React, Express, Database ORMs).
*   **Data Flow:** Define explicit data flow between layers. Use simple data structures (Plain Old JavaScript Objects/interfaces) for input and output across layer boundaries.
*   **Well-Defined Interfaces:** Define clear interfaces (ports) between layers to describe the communication contracts. Avoid implicit dependencies.
*   **Persistence Ignorance:** Entities and Use Cases should be unaware of how data is persisted. This concern belongs to the Gateway or Repository adapters.
*   **Avoid Global State:** Minimize or avoid global state where possible, especially in core layers. Pass data explicitly between components and layers.
*   **Error Handling:** Define a consistent error handling strategy across all layers. Errors should be passed inwards, but their handling and presentation can be adapted outwards.

### Examples (Clean Architecture)

<example type="valid">
TypeScript
// User type definition (assuming it's in a shared types file or domain)
type User = { id: string; name: string; /* other properties */ };

// Good: Use Case (Inner Layer)
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

class GetUserByIdUseCase {
  constructor(private userRepository: UserRepository) {} // IoC
  async execute(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }
}

// Good: Adapter (Outer Layer)
class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // MongoDB specific logic
    // Example: return await UserModel.findById(id).lean();
    return null;
  }
  async save(user: User): Promise<void> {
    // MongoDB specific logic
    // Example: const userModel = new UserModel(user); await userModel.save();
  }
}
</example\>
<example type="invalid">
TypeScript

// Bad: Use Case directly importing framework (Dependency Rule Violation)
// import { Express } from 'express'; // BAD: Framework import in inner layer

class CreateUserUseCase {
  // execute(userData: any, req: Express.Request) { // BAD: Framework specific types
  execute(userData: any, req: any) { // Still conceptually bad if req is framework-specific
    //...
  }
}

// Bad: Entity with persistence logic (Persistence Ignorance Violation)
class Product {
  id: string;
  name: string;
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
  saveToDatabase(): void { // BAD: Entity knows about persistence
    // db.save(this);
  }
}
</example\>

## Clean Code: Object Calisthenics

This rule set enforces the Object Calisthenics principles to promote highly modular, testable, and maintainable code, focusing on object-oriented design best practices. Adherence to these principles is actively monitored through code reviews and refactoring processes, aiming for continuous improvement in code quality and maintainability.

*   **One Level of Indentation Per Method:** Limit each method/function to a single level of indentation. Refactor complex logic into smaller, well-named helper methods to reduce nesting.
*   **Don't Use the ELSE Keyword:** Avoid else blocks. Utilize guard clauses, polymorphism, or strategy patterns to eliminate conditional branches.
*   **Wrap All Primitives and Strings:** Encapsulate primitive types (e.g., string, number, boolean) and strings within meaningful domain objects to avoid 'primitive obsession'.
*   **First Class Collections:** Encapsulate any collection (Array, Map, Set) within a custom class. This class should expose domain-specific methods, not just proxy the collection's methods.
*   **One Dot Per Line:** Limit method chaining to a single dot per line (obj.methodA().methodB()). Break down complex chains to promote smaller objects and adhere to the Law of Demeter.
*   **Don't Abbreviate:** Use full, descriptive names for classes, variables, and methods. Avoid abbreviations that obscure meaning (e.g., usr -> user).
*   **Keep All Entities Small:** Keep classes and functions small. Aim for classes with no more than 50 lines and functions with no more than 10-15 lines, promoting single responsibility.
*   **No Classes With More Than Two Instance Variables:** Limit each class to a maximum of two instance variables (fields/properties). Consider composition if more are needed.
*   **No Getters/Setters/Properties:** Avoid public getters and setters that expose internal state directly. Provide methods that describe *what* an object does, favoring command-query separation.

### Examples (Object Calisthenics)

<example type="valid">
TypeScript
// Assuming Order and User types are defined elsewhere
type Order = { isValid: () => boolean; processPayment: () => void; dispatch: () => void; };
type User = { isActive: () => boolean; getAddress: () => Address; };
type Address = { getCity: () => string; };
declare function getUser(): User;
class InvalidOrderError extends Error {}

// One Level of Indentation, No ELSE
function processOrder(order: Order): void {
  if (!order.isValid()) {
    throw new InvalidOrderError();
  }
  order.processPayment();
  order.dispatch();
}

// Wrapped Primitive
class Email {
  constructor(private value: string) {
    if (!this.value.includes('@')) { // Basic validation in constructor
        throw new Error("Invalid email format");
    }
  }
  getValue(): string { return this.value; } // Expose value if needed, but prefer behavior methods
  isEqualTo(otherEmail: Email): boolean {
    return this.value === otherEmail.getValue();
  }
}

// First Class Collection
class UsersCollection { // Renamed from "Users" to avoid conflict with potential "User" type
  private usersList: User[]; // Renamed from "users"
  constructor(users: User[]) { this.usersList = users; }
  findActiveUsers(): UsersCollection {
    return new UsersCollection(this.usersList.filter(u => u.isActive()));
  }
  // Add other domain-specific methods here
}

// One Dot Per Line
const userInstance = getUser(); // Renamed from "user"
const userAddress = userInstance.getAddress(); // Renamed from "address"
const userCity = userAddress.getCity(); // Renamed from "city"

// No Getters/Setters
class Account {
  private balance: number = 0;
  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Deposit amount must be positive.");
    this.balance += amount;
  }
  withdraw(amount: number): void {
    if (amount <= 0) throw new Error("Withdrawal amount must be positive.");
    if (this.balance < amount) throw new Error("Insufficient funds.");
    this.balance -= amount;
  }
  getBalance(): number { // Query method, if absolutely necessary for display/reporting
    return this.balance;
  }
}
</example\>
<example type="invalid">
TypeScript
// Assuming Order type is defined elsewhere
type Order = { isValid: () => boolean; hasPayment: () => boolean; processPayment: () => void; };

// Multiple Indentation Levels, ELSE
function processOrderInvalid(order: Order): void { // Renamed to avoid conflict
  if (order.isValid()) {
    if (order.hasPayment()) {
      order.processPayment();
    } else {
      throw new Error("No payment");
    }
  } else {
    throw new Error("Invalid order");
  }
}

// Primitive Obsession
function sendEmail(email: string) { /*... */ }

// Direct Collection Usage
// const activeUsers = users.filter(u => u.isActive()); // Assuming 'users' is an array of User

// Multiple Dots Per Line
// const city = getUser().getAddress().getCity();

// Getters/Setters
class AccountInvalid { // Renamed to avoid conflict
  private _balance: number = 0;
  get balance(): number { return this._balance; }
  set balance(value: number) { this._balance = value; }
}
</example\>

## Technology/Tool Specific Best Practices

### Electron.js Best Practices

This rule set guides the AI in developing robust, secure, and performant Electron applications by enforcing best practices for process separation, inter-process communication (IPC), and security.

*   **Separate Main and Renderer Processes:** Strictly separate logic. The main process handles app lifecycle and native APIs. Renderer processes handle UI. Avoid mixing concerns.
*   **IPC Communication:** Use ipcMain and ipcRenderer for all communication between main and renderer processes. Define clear, descriptive channel names and send only necessary data.
*   **Security Best Practices:** Implement strict security: enable contextIsolation, disable nodeIntegration in renderer processes, and use preload scripts to expose only safe APIs via contextBridge.
*   **Preload Scripts:** All inter-process communication (IPC) for renderer processes must be handled via a secure preload script. Do not expose Node.js APIs directly to the renderer.
*   **Context Bridge Usage:** Expose only specific, safe functions and objects from the main process to the renderer via contextBridge in the preload script. Avoid exposing ipcRenderer directly.
*   **Resource Handling:** Manage application resources (files, database connections) primarily in the main process. Renderers should request these resources via IPC.
*   **Performance Considerations:** Optimize startup time and resource usage. Lazy-load modules, minimize synchronous operations, and manage memory efficiently, especially for multiple windows.
*   **Error Handling and Logging:** Implement robust error handling across both processes. Centralize logging for main and renderer errors to facilitate debugging.
*   **Native Module Integration:** When using native Node.js modules, ensure they are correctly rebuilt for Electron and handled exclusively in the main process.

#### Examples (Electron.js)

<example type="valid">
TypeScript

// main.ts (Main Process)
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

function createWindow(): void {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Ensure preload.js is correctly pathed
      contextIsolation: true,
      nodeIntegration: false,
    }
  });
  win.loadFile('index.html'); // Ensure index.html is correctly pathed
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle('get-app-version', (): string => app.getVersion());

// preload.ts (Preload Script)
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
});

// renderer.ts (Renderer Process - assuming 'window.api' is typed globally or cast)
// Example: (window as any).api.getAppVersion() or define a global type for window.api
declare global {
    interface Window {
        api: {
            getAppVersion: () => Promise<string>;
        }
    }
}

async function displayVersion(): Promise<void> {
  const version = await window.api.getAppVersion();
  const versionElement = document.getElementById('version');
  if (versionElement) {
    versionElement.innerText = `App Version: ${version}`;
  }
}

displayVersion().catch(console.error);
</example\>
<example type="invalid">
TypeScript

// main.ts (Main Process - BAD)
import { app, BrowserWindow } from 'electron';

function createWindowInvalid(): void { // Renamed
  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true, // BAD: Exposes Node.js to renderer
      contextIsolation: false, // BAD: Disables context isolation
    }
  });
  win.loadFile('index.html');
}

// app.whenReady().then(createWindowInvalid); // Commented out to avoid running

// renderer.ts (Renderer Process - BAD)
// import fs from 'fs'; // BAD: Direct Node.js import in renderer if nodeIntegration were true

// Example of bad practice if nodeIntegration were true:
// fs.readFile('package.json', 'utf-8', (err, data) => {
//   if (err) {
//     console.error(err);
//     return;
//   }
//   console.log(data);
// });
</example\>

### React Best Practices

This rule set guides the AI in developing maintainable, performant, and accessible React components by enforcing modern best practices.

*   **Functional Components & Hooks:** Always use functional components and React Hooks (useState, useEffect, useContext, useCallback, useMemo, etc.) for state management and side effects. Avoid class components.
*   **Component Structure:** Organize components logically (e.g., Atomic Design). Each component should ideally adhere to the Single Responsibility Principle, doing one thing well. Break down complex components.
*   **Prop Drilling Avoidance:** Minimize prop drilling. For deeply nested data, consider useContext or a dedicated state management library (e.g., Redux, Zustand) for global state.
*   **Memoization for Performance:** Use React.memo, useCallback, and useMemo judiciously to prevent unnecessary re-renders of components, functions, and expensive calculations.
*   **Key Prop for Lists:** Always provide a stable, unique key prop when rendering lists of elements. The key should ideally be derived from the item's ID, not its index.
*   **Accessibility (A11y):** Prioritize web accessibility. Use semantic HTML, aria-\* attributes where necessary, and ensure keyboard navigation and screen reader compatibility.
*   **Conditional Rendering:** Use clear and readable conditional rendering techniques (e.g., ternary operators, logical &&, short-circuiting, or dedicated if statements).
*   **State Management:** Manage component local state with useState. For shared or global state, evaluate useContext or a state management library based on application complexity.
*   **Custom Hooks for Logic Reuse:** Extract reusable, stateful logic into custom Hooks. Name them starting with `use`.
*   **Side Effects with useEffect:** Handle all side effects (data fetching, subscriptions, DOM manipulations) within useEffect hooks. Ensure correct dependency arrays to prevent infinite loops or stale closures.
*   **Styling Consistency:** Maintain a consistent styling approach (e.g., Tailwind CSS, CSS Modules, Styled Components). Use a design system if available.

#### Examples (React)

<example type="valid">
TypeScript

// Good: Functional Component with Hook, Key Prop, Semantic HTML
import React, { useState } from 'react';

type Item = {
  id: string;
  name: string;
};

type ItemListProps = {
  items: Item[]; // Corrected to be an array of Item
};

export function ItemList({ items }: ItemListProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null); // Corrected useState usage

  return (
    <ul aria-label="List of items">
      {items.map((item) => (
        <li key={item.id} onClick={() => setSelectedItem(item)} tabIndex={0} role="button"> {/* Added tabIndex and role for accessibility */}
          {item.name}
        </li>
      ))}
    </ul>
  );
}
</example\>
<example type="invalid">
TypeScript

// Bad: Class Component, Missing Key, Div Soup
import React, { Component } from 'react'; // Added Component import

type Item = { // Added Item type for props
  id: string; // Added id for potential key
  name: string;
};

type ItemListInvalidProps = { // Renamed and defined props
    items: Item[];
};

class ItemListInvalid extends Component<ItemListInvalidProps> { // Added props typing
  render() {
    return (
      <div>
        {this.props.items.map((item, index) => ( // BAD: Using index as key if IDs are available and stable
          <div key={index}>{item.name}</div> // BAD: Non-semantic div, using index as key
        ))}
      </div>
    );
  }
}
</example\>

### TypeScript Best Practices

This rule set guides the AI to adhere to fundamental TypeScript best practices, ensuring robust type safety, clear interface definitions, and modern module usage.

*   **Type Safety Enforcement:** Explicitly define types for all variables, function arguments, and return values. Avoid `any` unless absolutely necessary and justified with a comment.
*   **Interface/Type Definition:** Use `interface` or `type` for object shapes and complex types. Organize these definitions in dedicated types or interfaces files/folders.
*   **Readonly Properties:** Apply `readonly` to properties that should not be reassigned after initialization in interfaces, types, and classes.
*   **Enums vs. Union Types:** Prefer union types ('value1' | 'value2') for simple literal sets. Use `enum` for distinct sets of related constants with symbolic names.
*   **Generics for Reusability:** Employ generics to create reusable components and functions that maintain type safety across different types.
*   **Null and Undefined Handling:** Explicitly handle `null` or `undefined` values using optional chaining (`?.`), nullish coalescing (`??`), or type guards.
*   **ESM Modules:** Always prefer ES module syntax (`import`/`export`) for module definitions and imports.
*   **Strict Compiler Options:** Assume strict TypeScript compiler options (e.g., `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`) are enabled and write code compatible with them.

#### Examples (TypeScript)

<example type="valid">
TypeScript

type UserProfile = { // Renamed from User to avoid conflict with other examples
  readonly id: string;
  name: string;
  email?: string;
};

type UserRoleType = 'admin' | 'editor' | 'viewer'; // Renamed from UserRole

function getUserProfileById(id: string): UserProfile | undefined { // Renamed from getUserById
  //... logic
  if (id === '123') {
    return { id: '123', name: 'John Doe' };
  }
  return undefined;
}

const userRoleInstance: UserRoleType = 'admin'; // Renamed from role
</example\>
<example type="invalid">
TypeScript

function processAnyData(data: any) { // Renamed, Avoid 'any'
  //...
}

class MutableConfig { // Renamed
  value: string = "initial"; // Should be readonly if not meant to be re-assigned from outside post-construction
}

enum StringStatus { // Renamed, Prefer union for simple strings like this
  Active = 'ACTIVE',
  Inactive = 'INACTIVE'
}

let userObject: { name: string }; // Use interface/type alias
userObject = { name: "Jane" };
</example\>

### Vite.js Best Practices

This rule set guides the AI in leveraging Vite's capabilities for fast development and optimized production builds, focusing on configuration, asset handling, and environment variables.

*   **Vite Native Features:** Utilize Vite's native ES module imports for fast Hot Module Replacement (HMR) and development server. Avoid build-tool specific imports or configurations unless absolutely necessary.
*   **Configuration (vite.config.ts):** Keep `vite.config.ts` clean and minimal. Use plugins for extended functionality rather than complex custom logic directly within the config.
*   **Plugin Ecosystem:** Prefer official or well-maintained community Vite plugins for common needs (e.g., React Fast Refresh, SVG imports, asset handling).
*   **Asset Handling:** Manage static assets (images, fonts, CSS) using Vite's built-in asset handling. Use the `public` folder for static assets that need to be served directly without processing.
*   **Environment Variables:** Use `import.meta.env` for accessing environment variables, following Vite's convention. Prefix custom environment variables with `VITE_`.
*   **Optimized Builds:** Assume Vite's default build optimizations (code splitting, tree-shaking) are active. Structure code to benefit from these, especially for production builds.
*   **Dev vs. Prod Configuration:** Separate development and production specific configurations within `vite.config.ts` using `mode` checks if needed, but aim for a unified approach where possible.
*   **CSS Pre-processors:** Integrate CSS pre-processors (e.g., Sass, Less) seamlessly with Vite if required, ensuring correct configuration in `vite.config.ts`.

#### Examples (Vite.js)

<example type="valid">
TypeScript

// vite.config.ts (Good)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This is one way to expose env vars, but import.meta.env is preferred for VITE_ prefixed vars
    // 'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL), // Better handled by import.meta.env directly
  },
  build: {
    sourcemap: true,
  },
});

// Example usage in component (assuming VITE_API_URL is in .env file)
// const apiUrl = import.meta.env.VITE_API_URL;
</example\>
<example type="invalid">
TypeScript

// vite.config.ts (Bad Practices Example)
import { defineConfig } from 'vite';

export default defineConfig({
  // BAD: Complex proxy logic directly in config (can be okay if necessary, but plugins are often cleaner for common cases)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\\/api/, ''),
      },
    },
  },
  // BAD: Directly using process.env for custom vars without VITE_ prefix and relying on define
  // define: {
  //   'process.env.MY_SECRET_KEY': JSON.stringify(process.env.MY_SECRET_KEY), // Should be VITE_MY_SECRET_KEY and accessed via import.meta.env
  // },
});
</example\>

### Zod Best Practices

This rule set guides the AI in effectively using Zod for schema definition, data validation, and TypeScript type inference, ensuring robust data integrity.

*   **Schema First Approach:** Always define a Zod schema for input validation before processing any external data (e.g., API responses, form submissions, environment variables).
*   **Strict Object Schemas:** Prefer `z.object().strict()` for object schemas to disallow unknown keys by default, enhancing data integrity and preventing unexpected data.
*   **Type Inference:** Utilize Zod's `z.infer<typeof yourSchema>` to derive TypeScript types directly from your schemas. This ensures type safety and consistency between runtime validation and compile-time types.
*   **Refinement for Complex Logic:** Use `z.refine()` or `z.superRefine()` for complex validation logic that cannot be expressed with built-in Zod methods (e.g., cross-field validation, custom business rules).
*   **Error Message Customization:** Provide descriptive custom error messages for validation failures using the `.min()`, `.max()`, `.email()`, etc., methods or by passing an error object to `z.string()` etc.
*   **Optional and Nullable Fields:** Clearly distinguish between optional (`z.optional()`), nullable (`z.nullable()`), and default (`z.default()`) fields in schemas to reflect data presence accurately.
*   **Transformations (`.transform()`):** Use `.transform()` for data transformations *after* validation. For example, parsing strings to numbers or dates, ensuring data is in the desired format post-validation.
*   **Union Types:** Leverage `z.union()` for fields that can have multiple valid types (e.g., a field that can be a string or a number), providing flexible validation.
*   **Validation in API Endpoints/Entry Points:** Perform Zod validation at the earliest possible entry point for external data, typically in API routes, controller functions, or command handlers, to ensure data cleanliness.

#### Examples (Zod)

<example type="valid">
TypeScript

import { z } from 'zod';

// Good: Strict schema, type inference, custom error, refinement
const UserValidationSchema = z.object({ // Renamed to avoid conflict
  id: z.string().uuid(),
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.union([z.literal('admin'), z.literal('user')]).default('user'),
}).strict().refine(data => {
  if (data.role === 'admin' && !data.age) { // Note: This logic might be too simple for a real case
    return false; // Admins must have age defined
  }
  return true;
}, { message: "Admin users must have an age defined", path: ["age"] });

type ValidatedUser = z.infer<typeof UserValidationSchema>; // Renamed

const validUserData: ValidatedUser = UserValidationSchema.parse({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Alice', email: 'alice@example.com' });
</example\>
<example type="invalid">
TypeScript

import { z } from 'zod';

// Bad: Non-strict schema, no custom errors, missing handling
const ProductValidationSchema = z.object({ // Renamed
  name: z.string(),
  price: z.number(),
  // BAD: No strict() by default, allows extra fields
  // BAD: No custom error message for price if it's negative, for example
});

type ProductType = z.infer<typeof ProductValidationSchema>; // Renamed

// BAD: Direct usage without parsing/validation, type safety might be bypassed if rawData is 'any'
const rawProductData = { name: 'Laptop', price: 1200, extraField: 'ignored' };
// const product: ProductType = rawProductData; // This would error if ProductType is strictly followed, but the schema doesn't prevent extraField
// To correctly validate and get typed data:
// const validatedProduct = ProductValidationSchema.parse(rawProductData); // Would fail if not .strict() and extraField was present
</example\>

## Project Maintenance Practices

Maintaining a clean codebase free of obsolete components is crucial for the long-term health of the project. The following practices are recommended based on cleanup process audits:

*   **History of Obsolete Code:**
    *   Maintain a record of removed files and components.
    *   Include the justification for their obsolescence (e.g., in an `OBSOLETE_COMPONENTS.md` file or similar in the project documentation).
*   **Cleanup Process Documentation:**
    *   The process of identifying, analyzing, and removing obsolete code should be documented.
    *   Consider using templates to list files and components candidates for removal.
    *   Document how to handle exception scenarios, such as shared components or those with non-obvious dependencies.
*   **Traceability of Obsolescence:**
    *   When marking files or components as obsolete, there should be a clear link (reference to ADRs, issues, or design decisions) to the architectural or business justification that led to the decision.
*   **Cross-Validation and Backup:**
    *   Before mass deletion of code, perform static dependency analyses (where possible) to confirm non-usage.
    *   Always perform backups or ensure the version control system allows for easy rollback (e.g., create git tags) before major removals.
*   **Automation and Tooling:**
    *   Consider creating scripts to assist in generating lists of candidate files for obsolescence or to validate paths and permissions before deletion.

Adopting these practices helps ensure that the cleanup process is safe, traceable, and well-understood by the team.
