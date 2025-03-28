import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

import { ThemeProvider } from "./components/providers/theme";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/dashboard";
import ActivityLog from "@/components/activity-log";
import Documentation from "@/components/documentation";
import RepositorySettings from "@/components/repository-settings";
import ModelSettings from "@/components/model-settings";
import { SystemLabel } from "./components/messages/common";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <I18nProvider i18n={i18n}>
        <div className="flex h-screen bg-background">
          {/* Sidebar */}
          <div className="w-64 border-r bg-card p-4 flex flex-col">
            <h1 className="text-2xl font-bold mb-6">
              <SystemLabel />
            </h1>

            {/* <nav className="space-y-1">
              <a
                href="#"
                className="flex items-center px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
                Dashboard
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-sm rounded-md text-foreground hover:bg-accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Documentation
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-sm rounded-md text-foreground hover:bg-accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Activity Log
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-sm rounded-md text-foreground hover:bg-accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                Repositories
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-sm rounded-md text-foreground hover:bg-accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
                  <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
                  <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
                </svg>
                Models
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-sm rounded-md text-foreground hover:bg-accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Settings
              </a>
            </nav> */}

            <div className="mt-auto">
              <div className="bg-muted p-3 rounded-md">
                <div className="text-sm font-medium">Active Model</div>
                <div className="text-xs text-muted-foreground mt-1">
                  mistralai/Mistral-7B-v0.1
                </div>
                <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Memory: 45%</span>
                  <span>4.5GB / 10GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="dashboard" className="w-full">
              <div className="border-b sticky top-0 bg-background z-10">
                <div className="flex h-16 items-center px-4">
                  <TabsList className="ml-auto">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                    <TabsTrigger value="docs">Documentation</TabsTrigger>
                    <TabsTrigger value="repos">Repositories</TabsTrigger>
                    <TabsTrigger value="models">Models</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <div className="p-4">
                <TabsContent value="dashboard" className="mt-0">
                  <Dashboard />
                </TabsContent>
                <TabsContent value="activity" className="mt-0">
                  <ActivityLog />
                </TabsContent>
                <TabsContent value="docs" className="mt-0">
                  <Documentation />
                </TabsContent>
                <TabsContent value="repos" className="mt-0">
                  <RepositorySettings />
                </TabsContent>
                <TabsContent value="models" className="mt-0">
                  <ModelSettings />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </I18nProvider>
      <Toaster />
    </ThemeProvider>
  );
}
