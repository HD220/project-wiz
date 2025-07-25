import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Bot, Palette, X, Search } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";

const settingsCategories = [
  {
    label: "CONFIGURAÇÕES DE APP",
    items: [
      {
        id: "appearance",
        label: "Aparência",
        icon: Palette,
        path: "/user/settings/appearance",
      },
    ],
  },
  {
    label: "CONFIGURAÇÕES DE IA",
    items: [
      {
        id: "llm-providers",
        label: "Provedores LLM",
        icon: Bot,
        path: "/user/settings/llm-providers",
      },
    ],
  },
];

function SettingsLayout() {
  const navigate = Route.useNavigate();
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
      {/* Left Sidebar - Exatamente como Discord */}
      <div className="w-[232px] bg-[#2b2d31] flex flex-col">
        {/* Search bar no topo */}
        <div className="p-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar"
              className="pl-10 bg-[#1e1f22] border-0 text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-500"
            />
          </div>
        </div>

        {/* Navigation - sem header */}
        <div className="flex-1 px-5 pb-4">
          {settingsCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {category.label}
                </h3>
              </div>

              <div className="space-y-2">
                {category.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === "/user/settings" &&
                      location.pathname === "/user/settings/");

                  return (
                    <button
                      key={item.id}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar com close - igual Discord */}
        <div className="h-16 flex items-center justify-end px-6">
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

        {/* Content area com scroll */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-[740px] px-10 pb-20">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/settings")({
  component: SettingsLayout,
});
