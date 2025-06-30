import React from 'react';
import { Control } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/ui/components/ui/form';
import { Input } from '@/presentation/ui/components/ui/input';

import type { UserProfileFormData } from '../UserProfileForm';

interface UserProfileFormFieldProps {
  control: Control<UserProfileFormData>;
}

export function DisplayNameField({ control }: UserProfileFormFieldProps) {
  return (
    <FormField
      control={control}
      name="displayName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome de Exibição</FormLabel>
          <FormControl>
            <Input placeholder="Seu nome" {...field} />
          </FormControl>
          <FormDescription>Como seu nome aparecerá na aplicação.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
