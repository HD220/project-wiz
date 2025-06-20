> **Nota:** Este documento foi originado de `.roo/rules/` e contém diretrizes de desenvolvimento relevantes para o Project Wiz.

# **React Best Practices**

This rule set guides the AI in developing maintainable, performant, and accessible React components by enforcing modern best practices.

## **Context**

This rule applies to React component files (.jsx, .tsx) within the src directory. It should be automatically attached when working on these files.

## **Requirements**

* **Functional Components & Hooks:** Always use functional components and React Hooks (useState, useEffect, useContext, useCallback, useMemo, etc.) for state management and side effects. Avoid class components.
* **Component Structure:** Organize components logically (e.g., Atomic Design). Each component should ideally adhere to the Single Responsibility Principle, doing one thing well. Break down complex components.
* **Prop Drilling Avoidance:** Minimize prop drilling. For deeply nested data, consider useContext or a dedicated state management library (e.g., Redux, Zustand) for global state.
* **Memoization for Performance:** Use React.memo, useCallback, and useMemo judiciously to prevent unnecessary re-renders of components, functions, and expensive calculations.
* **Key Prop for Lists:** Always provide a stable, unique key prop when rendering lists of elements. The key should ideally be derived from the item's ID, not its index.
* **Accessibility (A11y):** Prioritize web accessibility. Use semantic HTML, aria-\* attributes where necessary, and ensure keyboard navigation and screen reader compatibility.
* **Conditional Rendering:** Use clear and readable conditional rendering techniques (e.g., ternary operators, logical &&, short-circuiting, or dedicated if statements).
* **State Management:** Manage component local state with useState. For shared or global state, evaluate useContext or a state management library based on application complexity.
* **Custom Hooks for Logic Reuse:** Extract reusable, stateful logic into custom Hooks. Name them starting with use.
* **Side Effects with useEffect:** Handle all side effects (data fetching, subscriptions, DOM manipulations) within useEffect hooks. Ensure correct dependency arrays to prevent infinite loops or stale closures.
* **Styling Consistency:** Maintain a consistent styling approach (e.g., Tailwind CSS, CSS Modules, Styled Components). Use a design system if available.

## **Examples**

<example type="valid">
// Good: Functional Component with Hook, Key Prop, Semantic HTML
import React, { useState } from 'react';

type Item = {
  id: string;
  name: string;
}

type ItemListProps = {
  items: Item;
}

export function ItemList({ items }:ItemListProps) {
  const = useState<Item | null>(null);

  return (
    <ul aria-label="List of items">
      {items.map((item) => (
        <li key={item.id} onClick={() => setSelectedItem(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
};
</example>

<example type="invalid">

TypeScript

// Bad: Class Component, Missing Key, Div Soup
import React from 'react';

class ItemList extends React.Component {
  render() {
    return (
      <div>
        {this.props.items.map((item, index) \=\> ( // BAD: Using index as key
          <div>{item.name}</div> // BAD: Non-semantic div
        ))}
      </div>
    );
  }
}
</example>
