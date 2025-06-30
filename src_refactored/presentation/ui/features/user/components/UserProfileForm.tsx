import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud, UserCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
import { Button } from '@/presentation/ui/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/presentation/ui/components/ui/form';
import { Input } from '@/presentation/ui/components/ui/input';

import { UserProfile, UserProfileFormData } from '@/shared/ipc-types'; // Import from shared types

interface UserProfileFormProps {
  initialData: UserProfile | null;
  onSubmit: (data: UserProfileFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const profileFormSchema = z.object({
  displayName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').max(50, 'O nome não pode exceder 50 caracteres.'),
  // email: z.string().email('Email inválido.').optional(), // Email usually not editable by user
  avatarUrl: z.string().url('URL do avatar inválida.').optional().or(z.literal('')), // For URL input, or handle File for upload
});


export function UserProfileForm({ initialData, onSubmit, isSubmitting }: UserProfileFormProps) {
  const [currentAvatarPreview, setCurrentAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: initialData?.displayName || '',
      avatarUrl: initialData?.avatarUrl || '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        displayName: initialData.displayName,
        avatarUrl: initialData.avatarUrl || '',
      });
      setCurrentAvatarPreview(initialData.avatarUrl || null);
    }
  }, [initialData, form]);


  const handleFormSubmit = async (data: UserProfileFormData) => {
    // If handling file upload, a different logic would be needed here.
    // For now, assuming avatarUrl is a string URL input.
    await onSubmit(data);
  };

  const handleAvatarUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    form.setValue('avatarUrl', url, {shouldDirty: true, shouldValidate: true});
    if (profileFormSchema.shape.avatarUrl.safeParse(url).success) {
        setCurrentAvatarPreview(url);
    } else {
        setCurrentAvatarPreview(initialData?.avatarUrl || null); // Revert if URL is invalid immediately
    }
  };


  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24 ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-sky-500">
              <AvatarImage src={currentAvatarPreview || undefined} alt={form.watch('displayName')} />
              <AvatarFallback className="text-3xl">
                {form.watch('displayName')?.substring(0, 1).toUpperCase() || <UserCircle size={40}/>}
              </AvatarFallback>
            </Avatar>
            {/* This button is a placeholder for a more complex file upload UI */}
            <Button variant="outline" size="sm" className="relative" onClick={() => toast.info("Upload de avatar via seleção de arquivo não implementado. Insira uma URL.")}>
               <UploadCloud className="mr-2 h-4 w-4" />
              Alterar Avatar (URL)
            </Button>
        </div>

        <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
            control={form.control}
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

            {initialData?.email && ( // Only show email if it exists, and make it read-only
                 <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input type="email" value={initialData.email} disabled readOnly />
                    </FormControl>
                    <FormDescription>Seu endereço de email (não pode ser alterado).</FormDescription>
                </FormItem>
            )}

            <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL do Avatar (Opcional)</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="https://example.com/avatar.png"
                                {...field}
                                onChange={(e) => {
                                    field.onChange(e); // RHF internal update
                                    handleAvatarUrlChange(e); // Custom handler for preview
                                }}
                            />
                        </FormControl>
                        <FormDescription>Insira a URL para sua imagem de avatar.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />


            <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}
