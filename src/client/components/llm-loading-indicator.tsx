import React from 'react';
import '../../styles/llm-loading-indicator.css';

interface LlmLoadingIndicatorProps {
  isLoading: boolean;
  size?: number;
}

export function LlmLoadingIndicator({ isLoading, size = 24 }: LlmLoadingIndicatorProps) {
  if (!isLoading) return null;

  return (
    <div
      className="llm-loading-indicator-container"
      role="status"
      aria-live="polite"
    >
      <div
        className="llm-loading-spinner"
        style={{ width: size, height: size }}
      />
    </div>
  );
}