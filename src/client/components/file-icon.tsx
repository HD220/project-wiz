import React from "react";

interface FileIconProps {
  ariaLabel: string;
}

/**
 * SVG icon for file representation.
 * Receives ariaLabel for accessibility.
 */
export const FileIcon: React.FC<FileIconProps> = ({ ariaLabel }) => (
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
    role="img"
    aria-label={ariaLabel}
  >
    <title>{ariaLabel}</title>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);