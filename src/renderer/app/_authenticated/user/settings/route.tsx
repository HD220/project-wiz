import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Bot, User, Palette, X } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";

const settingsCategories = [
  {
    label: "USER SETTINGS",
    items: [
      {
        id: "account",
        label: "My Account",
        icon: User,
        path: "/user/settings",
      },
      {
        id: "appearance",
        label: "Appearance",
        icon: Palette,
        path: "/user/settings/appearance",
      },
    ],
  },
  {
    label: "APP SETTINGS",
    items: [
      {
        id: "llm-providers",
        label: "AI Providers",
        icon: Bot,
        path: "/user/settings/llm-providers",
      },
    ],
  },
];

function SettingsLayout() {
  const navigate = Route.useNavigate();
  const location = useLocation();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg w-full max-w-[1000px] h-full max-h-[90vh] flex overflow-hidden shadow-2xl">
        {/* Sidebar */}
        <div className="w-[232px] bg-sidebar flex flex-col border-r border-sidebar-border">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/" })}
              className="h-8 w-8 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-2 pb-4">
            {settingsCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-6">
                <div className="px-2 mb-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {category.label}
                  </h3>
                </div>
                <div className="space-y-0.5">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.path ||
                      (item.path === "/user/settings" &&
                        location.pathname === "/user/settings/");

                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={`w-full justify-start h-8 px-2 text-base font-medium border-l-2 border-transparent transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-primary hover:bg-sidebar-accent/80"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }`}
                        onClick={() => navigate({ to: item.path })}
                      >
                        <Icon className="h-4 w-4 mr-3 shrink-0" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-card flex flex-col">
          <ScrollArea className="h-full">
            <div className="max-w-[740px] p-6">
              <Outlet />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/settings")({
  component: SettingsLayout,
});
