import { userQuery } from "@/hooks/use-core";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    try {
      await userQuery();
      console.log("usuario conectado");
    } catch (error) {
      console.log(error);
      console.log("usuario ausente, enviando para onbording");
      throw redirect({ to: "/onbording", replace: true });
    }
    console.log("usuario conectado, redirecionando para geral");
    throw redirect({ to: "/user", replace: true });
  },
});
