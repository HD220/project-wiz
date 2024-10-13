"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserConfig, userConfigSchema } from "./schema";
import { saveUserConfigAction } from "./user-config.actions";

export function UserConfigForm({
  defaultValues,
}: {
  defaultValues?: UserConfig;
}) {
  const form = useForm<UserConfig>({
    resolver: zodResolver(userConfigSchema),
    defaultValues: {
      api_token: defaultValues?.api_token || "",
      is_batch_api: defaultValues?.is_batch_api || true,
      budget: defaultValues?.budget || 0.0,
    },
  });

  async function onSubmit(values: UserConfig) {
    await saveUserConfigAction(values);
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Configurações do Usuário</CardTitle>
        <CardDescription>
          Ajuste suas preferências e configurações da API
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="api_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Insira seu token da API OpenAI"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_batch_api"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Usa Batch API</FormLabel>
                    <FormDescription>
                      Ative para usar a API em lote
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orçamento</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Insira seu orçamento"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Salvar Configurações
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
