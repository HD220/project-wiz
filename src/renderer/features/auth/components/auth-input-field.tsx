import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import type { AuthFieldConfig } from "@/renderer/features/auth/utils/auth.utils";
import { cn } from "@/renderer/lib/utils";

interface AuthInputFieldProps {
  field: {
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };
  config: AuthFieldConfig;
  disabled: boolean;
}

export function AuthInputField({
  field,
  config,
  disabled,
}: AuthInputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const IconComponent = config.icon;

  const inputType =
    config.type === "password" && showPassword ? "text" : config.type;

  return (
    <div className="relative group">
      <IconComponent
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-ring transition-colors duration-200"
        aria-hidden="true"
      />
      <Input
        {...field}
        type={inputType}
        placeholder={config.placeholder}
        disabled={disabled}
        className={cn(
          "pl-10 pr-10 h-10 text-sm border-input bg-background transition-all duration-200",
          "hover:border-ring/50 focus:border-ring focus:ring-2 focus:ring-ring/20 focus:ring-offset-0",
          "disabled:opacity-60 disabled:cursor-not-allowed",
        )}
        aria-describedby={field.name + "-error"}
        autoComplete={config.autoComplete}
      />
      {config.type === "password" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      )}
    </div>
  );
}
