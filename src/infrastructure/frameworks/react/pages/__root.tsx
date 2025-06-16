import { ThemeProvider } from "@/components/providers/theme";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@lingui/react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { i18n } from "../i18n";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Trans } from "@lingui/macro";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidError(error: Error, errorInfo: ErrorInfo) {
    // TODO: Log error to a reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
          <h2><Trans>Algo deu errado.</Trans></h2>
          <p><Trans>Por favor, tente recarregar a página.</Trans></p>
          {this.state.error && <pre style={{ fontSize: "0.8em", marginTop: "10px" }}>{this.state.error.toString()}</pre>}
        </div>
      );
    }
    return this.props.children;
  }
}

export const Route = createRootRoute({
  component: Layout,
});

export function Layout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <I18nProvider i18n={i18n}>
        <ErrorBoundary fallback={<p><Trans>Ocorreu um erro na aplicação.</Trans></p>}>
          <Outlet />
          <Toaster />
        </ErrorBoundary>
        {/* <TanStackRouterDevtools /> */}
      </I18nProvider>
    </ThemeProvider>
  );
}
