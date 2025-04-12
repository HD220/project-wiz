import React from "react";

function CheckIcon() {
  return (
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
      className="mr-2 text-green-500"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const permissions = [
  "Read and write access to code",
  "Read and write access to issues",
  "Read and write access to pull requests",
  "Read access to organization members",
];

export function PermissionsList() {
  return (
    <ul className="space-y-2 text-sm">
      {permissions.map((permission) => (
        <li className="flex items-center" key={permission}>
          <CheckIcon />
          <span>{permission}</span>
        </li>
      ))}
    </ul>
  );
}