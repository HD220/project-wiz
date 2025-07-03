import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { UserProfileAvatar } from "@/ui/features/user/components/profile/UserProfileAvatar";
import { UserProfileFormFields } from "@/ui/features/user/components/profile/UserProfileFormFields";

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(50, "O nome não pode exceder 50 caracteres."),
  email: z.string().email("Email inválido.").optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const mockUser = {
  displayName: "J. Doe",
  email: "j.doe@example.com",
  avatarUrl: "/avatars/01.png",
};

function UserProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAvatar, _setCurrentAvatar] = useState<string | null>(
    mockUser.avatarUrl,
  );

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: mockUser.displayName,
      email: mockUser.email,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    console.log("Dados do perfil submetidos:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    mockUser.displayName = data.displayName;
    toast.success("Perfil atualizado com sucesso (simulado)!");
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Button variant="outline" size="sm" className="mb-4" asChild>
        <Link to="/settings">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Configurações
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Perfil do Usuário</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e preferências.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UserProfileAvatar currentAvatar={currentAvatar} form={form} />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <UserProfileFormFields form={form} />
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isDirty}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/app/settings/profile/")({
  component: UserProfilePage,
});


