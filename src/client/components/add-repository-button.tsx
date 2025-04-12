import { Button } from "@/components/ui/button";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { AddRepositoryIcon } from "./add-repository-icon";

export function AddRepositoryButton() {
  const { i18n } = useLingui();

  return (
    <Button>
      <AddRepositoryIcon
        title={i18n._("Add repository icon")}
        desc={i18n._("Plus sign icon representing the action to add a new repository")}
      />
      <Trans>Add Repository</Trans>
    </Button>
  );
}