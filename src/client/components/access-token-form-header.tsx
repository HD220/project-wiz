import * as React from "react";
import { Trans } from "@lingui/macro";
import { CardHeader, CardDescription } from "./ui/card";

const AccessTokenFormHeader: React.FC = () => (
  <CardHeader>
    <h2
      id="access-token-form-title"
      className="leading-none font-semibold"
    >
      <Trans>GitHub Access Token</Trans>
    </h2>
    <CardDescription>
      <Trans>Provide a GitHub personal access token with appropriate permissions</Trans>
    </CardDescription>
  </CardHeader>
);

export default AccessTokenFormHeader;