> **Nota:** Este documento foi originado de `.roo/rules/` e contém diretrizes de desenvolvimento relevantes para o Project Wiz.

# **Clean Code: Object Calisthenics**

This rule set enforces the Object Calisthenics principles to promote highly modular, testable, and maintainable code, focusing on object-oriented design best practices.

## **Context**

This rule applies globally to all code files within the project. It aims to guide the AI in generating and refactoring code to adhere to these strict principles.

## **Requirements**

* **One Level of Indentation Per Method:** Limit each method/function to a single level of indentation. Refactor complex logic into smaller, well-named helper methods to reduce nesting.
* **Don't Use the ELSE Keyword:** Avoid else blocks. Utilize guard clauses, polymorphism, or strategy patterns to eliminate conditional branches.
* **Wrap All Primitives and Strings:** Encapsulate primitive types (e.g., string, number, boolean) and strings within meaningful domain objects to avoid 'primitive obsession'.
* **First Class Collections:** Encapsulate any collection (Array, Map, Set) within a custom class. This class should expose domain-specific methods, not just proxy the collection's methods.
* **One Dot Per Line:** Limit method chaining to a single dot per line (obj.methodA().methodB()). Break down complex chains to promote smaller objects and adhere to the Law of Demeter.
* **Don't Abbreviate:** Use full, descriptive names for classes, variables, and methods. Avoid abbreviations that obscure meaning (e.g., usr \-\> user).
* **Keep All Entities Small:** Keep classes and functions small. Aim for classes with no more than 50 lines and functions with no more than 10-15 lines, promoting single responsibility.
* **No Classes With More Than Two Instance Variables:** Limit each class to a maximum of two instance variables (fields/properties). Consider composition if more are needed.
* **No Getters/Setters/Properties:** Avoid public getters and setters that expose internal state directly. Provide methods that describe *what* an object does, favoring command-query separation.

## **Examples**

<example type="valid">
TypeScript

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
  constructor(private value: string) {}
  isValid(): boolean { return this.value.includes('@'); }
}

// First Class Collection
class Users {
  private users: User;
  constructor(users: User) { this.users = users; }
  findActiveUsers(): Users {
    return new Users(this.users.filter(u => u.isActive()));
  }
}

// One Dot Per Line
const user = getUser();
const address = user.getAddress();
const city = address.getCity();

// No Getters/Setters
class Account {
  private balance: number;
  deposit(amount: number): void { this.balance \+= amount; }
  withdraw(amount: number): void { /*... */ }
}
</example>
<example type="invalid">
TypeScript

// Multiple Indentation Levels, ELSE
function processOrder(order: Order): void {
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
const activeUsers = users.filter(u => u.isActive());

// Multiple Dots Per Line
const city = getUser().getAddress().getCity();

// Getters/Setters
class Account {
  private _balance: number;
  get balance(): number { return this._balance; }
  set balance(value: number) { this._balance = value; }
}
</example>
