import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/app/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Página Inicial</h1>
      <p>Bem-vindo ao TanStack Router!</p>
    </div>
  );
}
