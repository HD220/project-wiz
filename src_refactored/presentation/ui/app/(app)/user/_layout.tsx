import { Outlet, createFileRoute } from '@tanstack/react-router';
import React from 'react';

// Placeholder for UserSidebar - will be created in the next step
// import { UserSidebar } from '@/presentation/ui/features/user/components/layout/UserSidebar';

// Temporary UserSidebar placeholder
// import { UserSidebar } from '@/presentation/ui/features/user/components/layout/UserSidebar'; // Uncomment when UserSidebar is ready
import { UserSidebar } from '@/presentation/ui/features/user/components/layout/UserSidebar';


function UserLayoutComponent() {
  return (
    <div className="flex flex-1 h-full overflow-hidden"> {/* flex-1 and h-full to take space from parent AppLayoutComponent */}
      <UserSidebar /> {/* Using the actual UserSidebar now */}

      {/* Área de Conteúdo Principal para DMs, Configurações do Usuário, etc. */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {/*
          O Outlet renderizará:
          - /user/index.tsx (página inicial do usuário)
          - /user/dm/$conversationId/index.tsx (chat DM)
          - ou outras sub-rotas de /user/ como /user/settings/profile se movêssemos as configs para cá.
          As páginas filhas devem gerenciar seu próprio padding e scroll se necessário.
        */}
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createFileRoute('/(app)/user/_layout')({
  component: UserLayoutComponent,
});
