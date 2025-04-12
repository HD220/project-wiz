/**
 * [Refactor] Standardized all prop and interface names for clarity and consistency:
 * - Renamed 'onSelectItem' to 'onItemSelect' in options, types, and implementation
 * - Updated comments and usage accordingly
 * See ISSUE-0184 and audit report for details.
 */
 
/**
 * useKeyboardNavigation hook
 *
 * Description:
 *   Manages refs and accessible keyboard navigation (ArrowUp/ArrowDown) for a list of items.
 *   Designed to be UI-agnostic, i18n-agnostic, and easily integrated with list components.
 *   Allows optional integration with selection logic via callback (onItemSelect).
 *   Exposes utilities for refs, keyboard handler, and item props for clean component integration.
 *
 * Dependencies & Integration Points:
 *   - Does NOT handle UI rendering, i18n, or selection state.
 *   - Can be integrated with selection logic (e.g., useFileSelection) via onItemSelect callback.
 *   - Can be used with any list of items (generic, index-based).
 *   - External callback (onItemSelect) is called when navigation occurs.
 *
 * Usage Example:
 *   const {
 *     getItemProps, // returns props for each item (ref, onKeyDown, tabIndex, etc)
 *     itemRefs,     // array of refs for items
 *     focusItem,    // function to focus item by index
 *     focusedIndex, // current focused item index
 *   } = useKeyboardNavigation({ itemCount, onItemSelect });
 *
 * Clean Architecture:
 *   - No coupling to UI, i18n, or selection state.
 *   - Pure navigation and ref management, easily testable.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type UseKeyboardNavigationOptions = {
  /**
   * Number of items in the navigable list.
   */
  itemCount: number;
  /**
   * Optional callback called when an item is navigated to (via keyboard).
   * Receives the navigated item index as argument.
   */
  onItemSelect?: (index: number) => void;
  /**
   * Optional initial focused item index.
   * Defaults to -1 (none focused).
   */
  initialFocusedIndex?: number;
};

export type UseKeyboardNavigationResult = {
  /**
   * Returns props to spread on each item (ref, onKeyDown, tabIndex, etc).
   * Should be called with the item's index.
   */
  getItemProps: (index: number) => {
    ref: (el: HTMLElement | null) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    tabIndex: number;
    onFocus: () => void;
  };
  /**
   * Array of refs for all items.
   */
  itemRefs: Array<HTMLElement | null>;
  /**
   * Focuses the item at the given index (if exists).
   */
  focusItem: (index: number) => void;
  /**
   * The index of the currently focused item (-1 if none).
   */
  focusedIndex: number;
};

/**
 * Hook to manage keyboard navigation and refs for a list of items.
 * Generic and decoupled from UI, i18n, and selection.
 */
export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions
): UseKeyboardNavigationResult {
  const { itemCount, onItemSelect, initialFocusedIndex = -1 } = options;

  // Array of refs for each item
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  // Index of the currently focused item
  const [focusedIndex, setFocusedIndex] = useState<number>(initialFocusedIndex);

  // Ensure refs array is always the correct length
  useEffect(() => {
    if (itemRefs.current.length !== itemCount) {
      itemRefs.current = Array(itemCount).fill(null);
    }
  }, [itemCount]);

  // Focuses the item at the given index (if exists)
  const focusItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < itemCount) {
        const el = itemRefs.current[index];
        if (el) {
          el.focus();
          setFocusedIndex(index);
          if (onItemSelect) {
            onItemSelect(index);
          }
        }
      }
    },
    [itemCount, onItemSelect]
  );

  // Handler for keyboard navigation (ArrowUp/ArrowDown)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        let nextIndex = index;
        if (e.key === "ArrowUp") {
          nextIndex = index > 0 ? index - 1 : itemCount - 1;
        } else if (e.key === "ArrowDown") {
          nextIndex = index < itemCount - 1 ? index + 1 : 0;
        }
        focusItem(nextIndex);
      }
    },
    [itemCount, focusItem]
  );

  // Handler for focus event to update focusedIndex
  const handleFocus = useCallback(
    (index: number) => {
      setFocusedIndex(index);
    },
    []
  );

  // Returns props to spread on each item
  const getItemProps = useCallback(
    (index: number) => ({
      ref: (el: HTMLElement | null) => {
        itemRefs.current[index] = el;
      },
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index),
      tabIndex: focusedIndex === index ? 0 : -1,
      onFocus: () => handleFocus(index),
    }),
    [focusedIndex, handleFocus, handleKeyDown]
  );

  return {
    getItemProps,
    itemRefs: itemRefs.current,
    focusItem,
    focusedIndex,
  };
}