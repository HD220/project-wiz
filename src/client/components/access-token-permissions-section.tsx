import React from "react";
import { PermissionsList } from "@/components/permissions-list";
import { Trans } from "@lingui/macro";

export function AccessTokenPermissionsSection() {
  return (
    <section aria-labelledby="access-token-permissions-title">
      <h2 id="access-token-permissions-title" className="text-base font-semibold mb-2">
        <Trans>Permissions</Trans>
      </h2>
      <PermissionsList />
    </section>
  );
}