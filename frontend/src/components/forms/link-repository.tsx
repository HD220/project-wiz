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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { linkRepositoryAction } from "@/actions/repository";
import { LinkRepositoryInput, linkRepositorySchema } from "@/actions/schemas";

export function LinkRepository() {
  const form = useForm<LinkRepositoryInput>({
    resolver: zodResolver(linkRepositorySchema),
    defaultValues: {
      git_url: "",
      provider: "github",
    },
  });

  async function onSubmit(values: LinkRepositoryInput) {
    await linkRepositoryAction(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provedor</FormLabel>
              <FormControl>
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Provedores</SelectLabel>
                      <SelectItem value="github">Github</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Provedor do repositório.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="git_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://github.com/project-wiz/autobot.git"
                  {...field}
                />
              </FormControl>
              <FormDescription>URL do repositório.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-1 justify-end">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
