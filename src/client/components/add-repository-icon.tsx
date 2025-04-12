import * as React from "react";
import { i18n } from "../i18n";

type AddRepositoryIconProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
  desc?: string;
};

export function AddRepositoryIcon({
  title,
  desc,
  ...svgProps
}: AddRepositoryIconProps) {
  const defaultTitle = i18n._("Add repository icon");
  const defaultDesc = i18n._(
    "Plus sign icon representing the action to add a new repository"
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2"
      focusable="false"
      role="img"
      aria-hidden="true"
      {...svgProps}
    >
      <title>{title ?? defaultTitle}</title>
      <desc>{desc ?? defaultDesc}</desc>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export default AddRepositoryIcon;