import { createFileRoute } from "@tanstack/react-router";
import { SystemText } from "@/components/messages/common";

export const Route = createFileRoute("/(public)/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 my-12">
      <div className="flex items-center justify-center">
        <h1 className="text-4xl"><SystemText /></h1>
      </div>
      <div className="flex items-center justify-center">

      </div>
    </div>
  );
}
