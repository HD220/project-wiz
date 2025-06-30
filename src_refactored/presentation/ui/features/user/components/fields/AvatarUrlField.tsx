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

interface AvatarUrlFieldProps extends UserProfileFormFieldProps {
  onUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AvatarUrlField({ control, onUrlChange }: AvatarUrlFieldProps) {
  return (
    <FormField
      control={control}
      name="avatarUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>URL do Avatar (Opcional)</FormLabel>
          <FormControl>
            <Input
              placeholder="https://example.com/avatar.png"
              {...field}
              onChange={(event) => {
                // RHF internal update
                field.onChange(event);
                // Custom handler for preview
                onUrlChange(event);
              }}
            />
          </FormControl>
          <FormDescription>Insira a URL para sua imagem de avatar.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
