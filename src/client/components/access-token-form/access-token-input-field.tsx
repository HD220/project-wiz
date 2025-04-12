import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Trans } from "@lingui/macro";
import type { I18n } from "@lingui/core";

interface AccessTokenInputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showToken: boolean;
  onToggleShow: () => void;
  error?: string;
  success?: string;
  i18n: I18n;
}

export const AccessTokenInputField: React.FC<AccessTokenInputFieldProps> = ({
  value,
  onChange,
  showToken,
  onToggleShow,
  error,
  success,
  i18n,
}) => (
  <div className="space-y-2">
    <Label htmlFor="access-token">
      <Trans>Personal Access Token</Trans>
    </Label>
    <div className="flex">
      <Input
        id="access-token"
        value={value}
        onChange={onChange}
        type={showToken ? "text" : "password"}
        className="rounded-r-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-invalid={!!error}
        aria-describedby={error ? "access-token-error" : undefined}
      />
      <Button
        type="button"
        variant="outline"
        className="rounded-l-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={onToggleShow}
        aria-label={
          showToken
            ? i18n._("accessTokenForm.hideTokenAria", {}, { message: "Hide token" })
            : i18n._("accessTokenForm.showTokenAria", {}, { message: "Show token" })
        }
      >
        {showToken
          ? i18n._("accessTokenForm.hide", {}, { message: "Hide" })
          : i18n._("accessTokenForm.show", {}, { message: "Show" })}
      </Button>
    </div>
    <p className="text-sm text-muted-foreground">
      <Trans>Token requires: repo, workflow, and read:org scopes</Trans>
    </p>
    <div aria-live="polite">
      {error && (
        <p id="access-token-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600">
          {success}
        </p>
      )}
    </div>
  </div>
);