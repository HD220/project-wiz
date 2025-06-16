import { useEffect } from "react";
import { useFormContext, Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { slugfy } from "@/shared/slugfy"; // Assuming slugfy is correctly located
import type { FormType } from "@/pages/(public)/onbording/index";
import { Trans, t } from "@lingui/macro";

// Define the expected part of the form schema this component handles
// This should match the fields used from the main form (OnboardingConfig)
export type UserInfoFormValues = {
  nickname: string;
  email: string;
  username: string;
  avatar: string;
};

interface UserInfoFormProps {
  control: Control<FormType>; // Control object from react-hook-form
  watch: UseFormWatch<FormType>;
  setValue: UseFormSetValue<FormType>;
}

export function UserInfoForm({ control, watch, setValue }: UserInfoFormProps) {
  const nickname = watch("nickname");

  const avatarDebounced = useDebouncedCallback(() => {
    setValue(
      "avatar",
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`
    );
  }, 200);

  useEffect(() => {
    setValue("username", slugfy(`${nickname}`));
  }, [nickname, setValue]);

  useEffect(() => {
    if (nickname) { // Avoid running debounce on initial empty nickname
        avatarDebounced();
    }
  }, [nickname, avatarDebounced]);

  return (
    <Card>
      <CardHeader>
        <CardTitle><Trans>Informações Pessoais</Trans></CardTitle>
        <CardDescription><Trans>Essas informações serão usadas para commits no git e para como
          o assistente se dirigirá a você.</Trans></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-1 gap-4 items-center">
          <FormField
            control={control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <div className="h-16 w-16 rounded-full overflow-hidden shadow-md m-5 border-4 border-b-muted">
                  <img
                    src={field.value}
                    alt={t`Avatar de Usuário`}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <FormControl>
                  <Input type="url" hidden {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-1 flex-col gap-4">
            <FormField
              control={control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name"><Trans>Nome</Trans></FormLabel>
                  <FormControl>
                    <Input placeholder={t`Seu nome`} {...field} />
                  </FormControl>
                  <FormDescription>
                    @{`${watch("username")}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel><Trans>Email</Trans></FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t`seu.email@exemplo.com`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
