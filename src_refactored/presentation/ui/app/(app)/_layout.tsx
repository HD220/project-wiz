import { Outlet, createFileRoute } from '@tanstack/react-router';
import React from 'react';

import { AppSidebar } from '@/presentation/ui/components/layout/AppSidebar';

function AppLayoutComponent(): JSX.Element {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* AppSidebar fina, sempre visível */}
      <AppSidebar />

      {/* Área de conteúdo principal que abrigará layouts aninhados ou páginas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* O Outlet renderizará o próximo nível de rota:
            - /app/user/_layout.tsx (com UserSidebar + Outlet para DMs)
            - /app/projects/$projectId/index.tsx (com ProjectContextSidebar + Outlet para seções do projeto)
            - /app/dashboard/index.tsx (diretamente a página)
            - /app/settings/index.tsx (diretamente a página)
            etc.
        */}
        <Outlet />
      </div>
    </div>
  );
}

// Define a rota de layout para o grupo (app)
// Todas as rotas dentro de /app/* usarão este layout como pai.
export const Route = createFileRoute('/(app)/_layout')({
  component: AppLayoutComponent,
});
