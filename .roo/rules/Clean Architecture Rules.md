---
description: Guide Clean Architecture principles for robust, testable, and scalable applications.
globs: *
alwaysApply: false
---

# **Clean Architecture Principles**

This rule set promotes strict adherence to Clean Architecture principles, ensuring the development of robust, testable, and scalable applications by defining clear layer responsibilities and dependency rules.

## **Context**

This rule is available for the AI to consider when tasks involve architectural design, structuring new features, or refactoring existing code to align with Clean Architecture. The AI should decide to include this rule based on the prompt's relevance to architectural concerns.

## **Requirements**

* **Dependency Rule:** Strictly enforce the Dependency Rule: dependencies must always point inwards. Inner circles (Entities, Use Cases) must not know anything about outer circles (Adapters, Frameworks/Drivers).  
* **Layer Separation:** Maintain clear separation between the four main layers:  
  * **Entities:** Core business rules, data structures, and enterprise-wide business rules. Pure domain objects.  
  * **Use Cases (Interactors):** Application-specific business rules. Orchestrates the flow of data to and from entities.  
  * **Adapters (Controllers, Gateways, Presenters):** Convert data from inner layers to outer layers (and vice-versa). Bridges between use cases and external frameworks/drivers.  
  * **Frameworks & Drivers (Web, DB, UI):** The outermost layer, dealing with specific technologies and external systems.  
* **Inversion of Control (IoC):** Utilize the Dependency Inversion Principle. Inner layers define interfaces (abstractions), and outer layers implement them. Dependencies are injected from the outside in.  
* **Testability:** Prioritize testability. Each layer, especially Entities and Use Cases, should be independently testable without reliance on external frameworks or databases.  
* **No Direct Framework Imports in Core:** The core business logic (Entities, Use Cases) must have zero direct imports or dependencies on any external framework (e.g., React, Express, Database ORMs).  
* **Data Flow:** Define explicit data flow between layers. Use simple data structures (Plain Old JavaScript Objects/interfaces) for input and output across layer boundaries.  
* **Well-Defined Interfaces:** Define clear interfaces (ports) between layers to describe the communication contracts. Avoid implicit dependencies.  
* **Persistence Ignorance:** Entities and Use Cases should be unaware of how data is persisted. This concern belongs to the Gateway or Repository adapters.  
* **Avoid Global State:** Minimize or avoid global state where possible, especially in core layers. Pass data explicitly between components and layers.  
* **Error Handling:** Define a consistent error handling strategy across all layers. Errors should be passed inwards, but their handling and presentation can be adapted outwards.

## **Examples**

<example type="valid">
TypeScript

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
    return null;
  }
  async save(user: User): Promise<void> {
    // MongoDB specific logic
  }
}

</example>
<example type="invalid">
TypeScript

// Bad: Use Case directly importing framework (Dependency Rule Violation)
import { Express } from 'express'; // BAD: Framework import in inner layer

class CreateUserUseCase {
  execute(userData: any, req: Express.Request) { // BAD: Framework specific types
    //...
  }
}

// Bad: Entity with persistence logic (Persistence Ignorance Violation)
class Product {
  id: string;
  name: string;
  saveToDatabase(): void { // BAD: Entity knows about persistence
    // db.save(this);
  }
}
</example>