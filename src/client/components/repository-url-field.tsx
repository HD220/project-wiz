import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface RepositoryUrlFieldProps {
  /** The current repository URL value */
  value: string;
  /** Callback to update the repository URL */
  onChange: (url: string) => void;
}

/**
 * RepositoryUrlField renders an input field for the repository URL.
 */
export function RepositoryUrlField({ value, onChange }: RepositoryUrlFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="repo-url">Default Repository URL</Label>
      <Input
        id="repo-url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://github.com/username/repository"
      />
    </div>
  );
}