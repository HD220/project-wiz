import { useId } from "react";
import { t } from "@lingui/macro";

/**
 * Hook to generate ARIA attributes and IDs for documentation viewer components.
 * Ensures accessibility and internationalization.
 *
 * @param file - The file object, may be undefined.
 * @param fileName - The name of the file to display.
 * @returns Object containing ariaLabel, regionId, and titleId.
 */
export function useDocumentationAria(
  file: { name: string } | undefined,
  fileName: string
): {
  ariaLabel: string;
  regionId: string;
  titleId: string;
} {
  const regionId = useId();
  const titleId = `${regionId}-title`;

  // Use file.name if available, otherwise fallback to fileName or a generic label
  const ariaLabel = file?.name
    ? t`Documentation for file: ${file.name}`
    : fileName
      ? t`Documentation for file: ${fileName}`
      : t`Documentation viewer`;

  return {
    ariaLabel,
    regionId,
    titleId,
  };
}