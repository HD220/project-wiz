import React from 'react';

interface PromptContainerProps {
  children: React.ReactNode;
}

export function PromptContainer({ children }: PromptContainerProps) {
  return (
    <div className="p-4 flex flex-col gap-4">
      {children}
    </div>
  );
}