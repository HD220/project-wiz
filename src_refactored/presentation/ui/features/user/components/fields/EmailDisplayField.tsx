import React from "react";

import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { UserProfile } from "@/core/domain/entities/user";

interface EmailDisplayFieldProps {
  email: UserProfile["email"] | undefined;
}

export function EmailDisplayField({ email }: EmailDisplayFieldProps) {
  if (!email) return null;

  return (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" value={email} disabled readOnly />
      </FormControl>
      <FormDescription>
        Seu endereço de email (não pode ser alterado).
      </FormDescription>
    </FormItem>
  );
}
