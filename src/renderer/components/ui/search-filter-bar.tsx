import { Search, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { Switch } from "@/renderer/components/ui/switch";
import { useDebounce } from "@/renderer/hooks/use-debounce.hook";
import { cn } from "@/renderer/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  // Search functionality
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;

  // Filter functionality
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
  filterPlaceholder?: string;

  // Toggle functionality
  toggleValue: boolean;
  onToggleChange: (value: boolean) => void;
  toggleLabel: string;
  toggleId: string;

  // Clear filters functionality
  hasFilters: boolean;
  onClearFilters: () => void;

  // Styling customization
  className?: string;
}

export function SearchFilterBar(props: SearchFilterBarProps) {
  const {
    searchValue,
    onSearchChange,
    searchPlaceholder,
    filterValue,
    onFilterChange,
    filterOptions,
    filterPlaceholder = "Filter",
    toggleValue,
    onToggleChange,
    toggleLabel,
    toggleId,
    hasFilters,
    onClearFilters,
    className,
  } = props;

  // PERFORMANCE FIX: Local state for immediate UI responsiveness
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // PERFORMANCE FIX: Debounce the search value before calling onSearchChange
  const debouncedSearchValue = useDebounce(localSearchValue, 300);

  // PERFORMANCE FIX: Sync with external searchValue changes (e.g., from URL or clear filters)
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // PERFORMANCE FIX: Only call onSearchChange when debounced value changes
  useEffect(() => {
    // Only call if the debounced value is different from the current search value
    if (debouncedSearchValue !== searchValue) {
      onSearchChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue, searchValue, onSearchChange]);

  // Inline validation for search input with immediate local state update
  function handleSearchInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    // Basic validation: limit search term length
    if (value.length > 100) return;

    // Update local state immediately for responsive UI
    setLocalSearchValue(value);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-[var(--spacing-component-md)] px-[var(--spacing-component-lg)] py-[var(--spacing-component-sm)] border-b border-border/30 bg-background/50 shrink-0",
        className,
      )}
    >
      {/* Search Input with ARIA label for accessibility */}
      <div className="relative flex-1 max-w-sm">
        <Search
          className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder={searchPlaceholder}
          value={localSearchValue}
          onChange={handleSearchInputChange}
          className="pl-10 h-9 border-border/60 bg-background/50 focus:bg-background"
          maxLength={100}
          aria-label={searchPlaceholder}
        />
      </div>

      {/* Filter Select */}
      <Select value={filterValue} onValueChange={onFilterChange}>
        <SelectTrigger className="w-36 h-9 border-border/60 bg-background/50">
          <SelectValue placeholder={filterPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Show Inactive Toggle */}
      <div className="flex items-center gap-[var(--spacing-component-sm)] px-[var(--spacing-component-sm)] py-[var(--spacing-component-sm)] rounded-md border border-border/60 bg-background/50">
        <Switch
          id={toggleId}
          checked={toggleValue}
          onCheckedChange={onToggleChange}
        />
        <label
          htmlFor={toggleId}
          className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
        >
          {toggleValue ? (
            <>
              <Eye className="w-4 h-4" />
              {toggleLabel}
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              {toggleLabel.replace("Show", "Hide")}
            </>
          )}
        </label>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="h-9 px-3"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
