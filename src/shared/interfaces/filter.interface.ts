export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, string | number | boolean>;
  dateRange?: DateRangeFilter;
}

export interface DateRangeFilter {
  start: string;
  end: string;
}

export interface SearchParams {
  query?: string;
  fields?: string[];
  exact?: boolean;
}
