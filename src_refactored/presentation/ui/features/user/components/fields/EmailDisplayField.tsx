import React from 'react';

import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from '@/presentation/ui/components/ui/form';
import { Input } from '@/presentation/ui/components/ui/input';

import type { UserProfile } from '@/shared/ipc-types';

interface EmailDisplayFieldProps {
  email: UserProfile['email'];
}

export function EmailDisplayField({ email }: EmailDisplayFieldProps) {
  if (!email) return null;

  return (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" value={email} disabled readOnly />
      </FormControl>
      <FormDescription>Seu endereço de email (não pode ser alterado).</FormDescription>
    </FormItem>
  );
}
