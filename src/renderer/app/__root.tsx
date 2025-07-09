import {
  createRootRoute,
  Link,
  Outlet,
  
} from "@tanstack/react-router";
import React from "react";

// Exemplo de como um componente de layout poderia ser usado, se existir:
// import { AppLayout } from '@/components/layout/AppLayout'; // Supondo que AppLayout exista

export const Route = createRootRoute({
  component: RootComponent,
  loader: () => {
    // throw redirect({ to: "/app" });
  },
});

function RootComponent() {
  return (
    <>
      {/*
        Envolver o Outlet com componentes de layout globais ou provedores de contexto aqui, se necessário.
        Exemplo:
        <ThemeProvider>
          <AppLayout> // Um componente de layout que você criaria
            <Outlet />
          </AppLayout>
        </ThemeProvider>
      */}
      <Outlet />
      <Link to={"."}>voltar</Link>
    </>
  );
}
