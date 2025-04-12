import { Button } from "@/components/ui/button";
import { useLingui } from "@lingui/react";

export function ExportButton() {
  const { i18n } = useLingui();

  return (
    <Button variant="outline" size="sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {i18n._("exportButton.exportAll", {}, { message: "Export All" })}
    </Button>
  );
}