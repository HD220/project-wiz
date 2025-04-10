import React from 'react';

interface LlmLoadingIndicatorProps {
  isLoading: boolean;
  size?: number;
}

export function LlmLoadingIndicator({ isLoading, size = 24 }: LlmLoadingIndicatorProps) {
  if (!isLoading) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 8 }}>
      <div
        style={{
          width: size,
          height: size,
          border: '3px solid #ccc',
          borderTop: '3px solid #333',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}