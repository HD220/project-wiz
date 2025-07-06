import { createFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectForm } from "@/ui/features/project/components/ProjectForm";

function NewProjectPage() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Criar Novo Projeto</CardTitle>
          <CardDescription>
            Forneça os detalhes abaixo para iniciar um novo projeto de software.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
      <Button
        variant="link"
        onClick={() => router.history.back()}
        className="mt-4"
      >
        Cancelar e Voltar
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/app/projects/new/")({
  component: NewProjectPage,
});
