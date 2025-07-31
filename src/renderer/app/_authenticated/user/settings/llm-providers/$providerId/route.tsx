import { createFileRoute, Outlet } from "@tanstack/react-router";

function ProviderLayout() {
  return (
    <div className="flex-1 flex flex-col">
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute(
  "/_authenticated/user/settings/llm-providers/$providerId",
)({
  component: ProviderLayout,
});
