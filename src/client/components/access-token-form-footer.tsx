import React from "react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trans } from "@lingui/macro";

/**
 * AccessTokenFormFooter
 * Stateless footer for AccessTokenForm, renders the submit button with i18n and accessibility.
 */
const AccessTokenFormFooter: React.FC = () => (
  <CardFooter>
    <Button type="submit" variant="default" aria-label="Submit access token">
      <Trans>Save Access Token</Trans>
    </Button>
  </CardFooter>
);

export default AccessTokenFormFooter;