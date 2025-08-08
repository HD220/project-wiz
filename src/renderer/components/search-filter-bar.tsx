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
import { useDebounce } from "use-debounce";
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
  const [debouncedSearchValue] = useDebounce(localSearchValue, 300);

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
        "border-b border-border/30 bg-background/50 shrink-0",
        "px-[var(--spacing-component-md)] lg:px-[var(--spacing-component-lg)] py-[var(--spacing-component-xs)] lg:py-[var(--spacing-component-sm)]", // Responsive padding
        className,
      )}
    >
      {/* Responsive layout: wrap on small screens */}
      <div
        className={cn(
          "flex items-center",
          "gap-[var(--spacing-component-sm)] lg:gap-[var(--spacing-component-md)]", // Responsive gap
          "flex-wrap lg:flex-nowrap", // Wrap on small screens
        )}
      >
        {/* Search Input - responsive width and position */}
        <div className="relative w-full min-w-0 order-1 lg:flex-1 lg:max-w-sm lg:order-none">
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

        {/* Filter controls row - wrap in compact mode */}
        <div className="flex items-center gap-[var(--spacing-component-sm)] lg:gap-[var(--spacing-component-md)] w-full order-2 flex-wrap lg:flex-shrink-0 lg:w-auto">
          {/* Filter Select - responsive width */}
          <Select value={filterValue} onValueChange={onFilterChange}>
            <SelectTrigger className="h-9 border-border/60 bg-background/50 min-w-[120px] flex-1 lg:w-36 lg:flex-none">
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

          {/* Toggle Switch - compact layout */}
          <div className="flex items-center gap-[var(--spacing-component-sm)] rounded-md border border-border/60 bg-background/50 px-2 py-1.5 lg:px-[var(--spacing-component-sm)] lg:py-[var(--spacing-component-sm)]">
            <Switch
              id={toggleId}
              checked={toggleValue}
              onCheckedChange={onToggleChange}
            />
            <label
              htmlFor={toggleId}
              className="text-muted-foreground cursor-pointer flex items-center gap-1 text-xs lg:text-sm"
            >
              {toggleValue ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden lg:inline">{toggleLabel}</span>
                  <span className="lg:hidden">
                    {toggleLabel.split(" ")[1] || toggleLabel}
                  </span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hidden lg:inline">
                    {toggleLabel.replace("Show", "Hide")}
                  </span>
                  <span className="lg:hidden">
                    {toggleLabel.replace("Show", "Hide").split(" ")[1] ||
                      toggleLabel.replace("Show", "Hide")}
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Clear Filters - responsive positioning */}
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-9 px-2 text-xs lg:px-3 lg:text-sm"
            >
              <span className="lg:hidden">Clear</span>
              <span className="hidden lg:inline">Clear Filters</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
