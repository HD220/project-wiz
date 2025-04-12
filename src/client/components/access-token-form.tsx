import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { useAccessTokenForm } from "../hooks/use-access-token-form";
import { AccessTokenInputField } from "./access-token-input-field";
import AccessTokenFormHeader from "./access-token-form-header";
import { AccessTokenPermissionsSection } from "./access-token-permissions-section";
import AccessTokenFormFooter from "./access-token-form-footer";

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
    handleSubmit,
    isLoading,
    error,
    permissions,
    isValid,
  } = useAccessTokenForm(accessToken, setAccessToken);

  return (
    <Card>
      <form onSubmit={handleSubmit} role="form" aria-labelledby="access-token-form-title">
        <AccessTokenFormHeader />
        <CardContent className="space-y-4">
          <AccessTokenInputField
            accessToken={accessToken}
            setAccessToken={setAccessToken}
            error={error}
            isLoading={isLoading}
            isValid={isValid}
          />
          <AccessTokenPermissionsSection />
        </CardContent>
        <AccessTokenFormFooter />
      </form>
    </Card>
  );
}