import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, UserCircle, UploadCloud } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(50, "O nome não pode exceder 50 caracteres."),
  // Email geralmente não é editável pelo usuário diretamente
  email: z.string().email("Email inválido.").optional(),
  // avatarFile: z.instanceof(File).optional(), // Para upload de arquivo real
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

// Mock user data
const mockUser = {
  displayName: "J. Doe",
  email: "j.doe@example.com",
  // Placeholder avatar
  avatarUrl: "/avatars/01.png",
};

function UserProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Para exibir o avatar
  const [currentAvatar, _setCurrentAvatar] = useState<string | null>(
    mockUser.avatarUrl
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
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Atualizar mock (apenas para demo)
    mockUser.displayName = data.displayName;
    // Se houvesse upload de avatar, aqui seria o local para processá-lo
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
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24 ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-sky-500">
              <AvatarImage
                src={currentAvatar || undefined}
                alt={form.watch("displayName")}
              />
              <AvatarFallback className="text-3xl">
                {form.watch("displayName")?.substring(0, 1).toUpperCase() || (
                  <UserCircle size={40} />
                )}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="relative">
              <UploadCloud className="mr-2 h-4 w-4" />
              Alterar Avatar (Não implementado)
              {/* <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     accept="image/*"
                     onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                           // form.setValue('avatarFile', e.target.files[0]);
                           // setCurrentAvatar(URL.createObjectURL(e.target.files[0]));
                           toast.info("Upload de avatar ainda não implementado.");
                        }
                     }}
              /> */}
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de Exibição</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormDescription>
                      Como seu nome aparecerá na aplicação.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Seu endereço de email (não pode ser alterado aqui).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
