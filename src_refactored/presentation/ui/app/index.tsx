import { createFileRoute, Link } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Página Inicial</h1>
      <p>Bem-vindo ao TanStack Router! teste</p>
      <Link to={"/app/agents"}>agents</Link>
      <Link to={"/app/chat"}>chat</Link>
      <Link to={"/app/dashboard"}>dashboard</Link>
      <Link to={"/app/personas"}>personas</Link>
      <Link to={"/app/projects"}>projects</Link>
      <Link to={"/app/settings"}>settings</Link>
      <Link to={"/app/user"}>user</Link>
    </div>
  );
}
