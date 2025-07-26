import {
  createFileRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { X, Settings, Bot } from "lucide-react";
import React from "react";

import { Button } from "@/renderer/components/ui/button";

function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle ESC key to close
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      navigate({ to: "/user" });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background flex"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Sidebar */}
      <div className="w-60 bg-[#2f3136] border-r border-[#202225] p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 rounded-full hover:bg-accent/80 text-gray-400"
            onClick={() => navigate({ to: "/user" })}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="space-y-6">
          {[
            {
              category: "User Settings",
              items: [
                {
                  path: "/user/settings/appearance",
                  label: "Appearance",
                  icon: Settings,
                },
              ],
            },
            {
              category: "App Settings",
              items: [
                {
                  path: "/user/settings/llm-providers",
                  label: "AI Providers",
                  icon: Bot,
                },
              ],
            },
          ].map((section) => (
            <div key={section.category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {section.category}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                        isActive
                          ? "bg-[#404249] text-white"
                          : "text-gray-300 hover:text-white hover:bg-[#35373c]"
                      }`}
                      onClick={() => navigate({ to: item.path })}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Press{" "}
            <span className="text-xs text-muted-foreground font-mono">ESC</span>{" "}
            to close
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">ESC</span>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-full hover:bg-accent/80"
              onClick={() => navigate({ to: "/user" })}
              title="Fechar configurações"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/settings")({
  component: SettingsLayout,
});
