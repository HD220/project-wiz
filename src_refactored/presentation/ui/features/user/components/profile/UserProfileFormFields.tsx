import React from "react";
import { UseFormReturn } from "react-hook-form";


import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ProfileFormData } from "@/ui/app/app/settings/profile";

interface UserProfileFormFieldsProps {
  form: UseFormReturn<ProfileFormData>;
}

export function UserProfileFormFields({ form }: UserProfileFormFieldsProps) {
  return (
    <>
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
    </>
  );
}
