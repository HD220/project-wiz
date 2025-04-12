import React from "react";

export function EmptyViewer() {
  return (
    <div
      className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-muted-foreground"
      role="region"
      aria-labelledby="empty-viewer-label"
      tabIndex={-1}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Empty file icon"
        focusable="false"
        aria-hidden="false"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <p id="empty-viewer-label" className="mt-2">
        Select a file to view its contents
      </p>
    </div>
  );
}