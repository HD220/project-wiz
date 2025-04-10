import React from 'react';

interface PromptStatusProps {
  error?: string | null;
  successMessage?: string | null;
  loading?: boolean;
}

export function PromptStatus({ error, successMessage, loading }: PromptStatusProps) {
  if (loading) {
    return <div className="text-gray-500">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (successMessage) {
    return <div className="text-green-600">{successMessage}</div>;
  }

  return null;
}