import React from "react";

/**
 * ErrorMessageProps defines the properties for the ErrorMessage component.
 */
export interface ErrorMessageProps {
  /** The error message to display */
  message: string;
  /** Optional: additional className for styling */
  className?: string;
}

/**
 * ErrorMessage component for displaying standardized error messages.
 */
export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <div className={`text-red-600 mb-2 ${className}`} role="alert">
      {message}
    </div>
  );
}