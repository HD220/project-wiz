import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, UserCircle } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// FormControl, etc. are used by sub-components
import { Form } from "@/components/ui/form";

import type { UserProfile, UserProfileFormData } from "@/shared/ipc-types";

import { AvatarUrlField } from "./fields/AvatarUrlField";
import { DisplayNameField } from "./fields/DisplayNameField";
import { EmailDisplayField } from "./fields/EmailDisplayField";

interface UserProfileFormProps {
  initialData: UserProfile | null;
  onSubmit: (data: UserProfileFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(50, "O nome não pode exceder 50 caracteres."),
  avatarUrl: z
    .string()
    .url("URL do avatar inválida.")
    .optional()
    .or(z.literal("")),
});

export function UserProfileForm({
  initialData,
  onSubmit,
  isSubmitting,
}: UserProfileFormProps) {
  const [currentAvatarPreview, setCurrentAvatarPreview] = useState<
    string | null
  >(initialData?.avatarUrl || null);

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: initialData?.displayName || "",
      avatarUrl: initialData?.avatarUrl || "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        displayName: initialData.displayName,
        avatarUrl: initialData.avatarUrl || "",
      });
      setCurrentAvatarPreview(initialData.avatarUrl || null);
    }
  }, [initialData, form]);

  const handleFormSubmit = async (data: UserProfileFormData) => {
    await onSubmit(data);
  };

  const handleAvatarUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const url = event.target.value;
    // The form value itself is updated by the field component via field.onChange
    if (profileFormSchema.shape.avatarUrl.safeParse(url).success) {
      setCurrentAvatarPreview(url);
    } else {
      // Revert to original avatar if new URL is immediately invalid and an empty string was not intended.
      // If an empty string is typed, it's valid for optional URL, so clear preview.
      setCurrentAvatarPreview(
        url === "" ? null : initialData?.avatarUrl || null
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-3">
        <Avatar className="h-24 w-24 ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-sky-500">
          <AvatarImage
            src={currentAvatarPreview || undefined}
            alt={form.watch("displayName")}
          />
          <AvatarFallback className="text-3xl">
            {form.watch("displayName")?.substring(0, 1).toUpperCase() || (
              <UserCircle size={40} />
            )}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="outline"
          size="sm"
          className="relative"
          onClick={() =>
            toast.info(
              "Upload de avatar via seleção de arquivo não implementado. Insira uma URL."
            )
          }
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Alterar Avatar (URL)
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <DisplayNameField control={form.control} />
          <EmailDisplayField email={initialData?.email} />
          <AvatarUrlField
            control={form.control}
            onUrlChange={handleAvatarUrlChange}
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
    </div>
  );
}
