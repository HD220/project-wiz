import { useNavigate, useLocation } from "@tanstack/react-router";
import { Settings, Bot } from "lucide-react";
import * as React from "react";

import { cn } from "@/renderer/lib/utils";

export function SettingsNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
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
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                    isActive
                      ? "bg-[#404249] text-white"
                      : "text-gray-300 hover:text-white hover:bg-[#35373c]",
                  )}
                  onClick={() => navigate({ to: item.path })}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
