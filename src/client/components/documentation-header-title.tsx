import { Trans } from "@lingui/react/macro";

export function DocumentationHeaderTitle() {
  return (
    <h2 className="text-3xl font-bold tracking-tight">
      <Trans id="documentation.title" comment="Documentation section title">
        Documentation
      </Trans>
    </h2>
  );
}