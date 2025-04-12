import { Input } from "@/components/ui/input";
import { useLingui } from "@lingui/react";

interface DocumentationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function DocumentationSearch({ value, onChange }: DocumentationSearchProps) {
  const { i18n } = useLingui();

  return (
    <div className="flex items-center space-x-2">
      <Input
        placeholder={i18n._("documentation.search.placeholder", {}, { message: "Search documentation..." })}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-sm"
        aria-label={i18n._("documentation.search.ariaLabel", {}, { message: "Search documentation" })}
        aria-describedby="documentation-search-desc"
        role="searchbox"
      />
      <span id="documentation-search-desc" className="sr-only">
        {i18n._("documentation.search.description", {}, { message: "Type to filter documentation files" })}
      </span>
    </div>
  );
}