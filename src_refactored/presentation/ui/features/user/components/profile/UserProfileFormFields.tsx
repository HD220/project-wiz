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

import { UserProfileFormData } from "../UserProfileForm";

interface UserProfileFormFieldsProps {
  form: UseFormReturn<UserProfileFormData>;
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
    </>
  );
}
