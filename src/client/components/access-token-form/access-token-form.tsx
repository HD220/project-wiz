import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { useAccessTokenForm } from "../../hooks/use-access-token-form";
import {
  AccessTokenFormFooter,
  AccessTokenFormHeader,
  AccessTokenInputField,
  AccessTokenPermissionsSection
} from "@/components/access-token-form";

interface AccessTokenFormProps {
  accessToken: string;
  setAccessToken: (token: string) => void;
}

export function AccessTokenForm({
  accessToken,
  setAccessToken,
}: AccessTokenFormProps) {
  const { i18n } = useLingui();

  const {
    showToken,
    error,
    success,
    handleToggleShow,
    handleInputChange,
    handleSubmit,
  } = useAccessTokenForm({ accessToken, setAccessToken });

  return (
    <Card>
      <form onSubmit={handleSubmit} role="form" aria-labelledby="access-token-form-title">
        <AccessTokenFormHeader />
        <CardContent className="space-y-4">
          <AccessTokenInputField
            value={accessToken}
            onChange={handleInputChange}
            showToken={showToken}
            onToggleShow={handleToggleShow}
            error={error ?? undefined}
            i18n={i18n}
          />
          <AccessTokenPermissionsSection />
        </CardContent>
        <AccessTokenFormFooter />
      </form>
    </Card>
  );
}