"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { saveUserConfigAction } from "./actions";
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UserConfigForm({
  repositories,
  defaultValues,
}: {
  repositories: { full_name: string; name: string }[];
  defaultValues?: UserConfig;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const form = useForm<UserConfig>({
    resolver: zodResolver(userConfigSchema),
    defaultValues: {
      api_token: defaultValues?.api_token || "",
      is_batch_api: defaultValues?.is_batch_api || true,
      budget: defaultValues?.budget || 0.0,
      allocations: [...(defaultValues?.allocations || [])],
    },
    reValidateMode: "onChange",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allocations",
  });

  const budget = form.watch("budget");
  const allocations = form.watch("allocations");

  const availableRepositories = useMemo(() => {
    return repositories.filter((repo) =>
      allocations.every((alloc) => alloc.repository != repo.full_name)
    );
  }, [allocations, repositories]);

  useEffect(() => {
    const totalAllocated = allocations.reduce(
      (sum, allocation) => sum + Number(allocation.budget),
      0
    );
    if (totalAllocated > Number(budget)) {
      form.setError("budget", {
        type: "manual",
        message:
          "O orçamento geral não pode ser menor que a soma das alocações.",
      });
    } else {
      form.clearErrors("budget");
    }
  }, [allocations, budget, form]);

  const addLine = () => {
    append({ repository: "", budget: 0.0 });
  };

  async function onSubmit(values: UserConfig) {
    try {
      await saveUserConfigAction(session!.user.username, values);

      toast({
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Algo errado aconteceu!",
      });
    }
  }

  const handleBudgetChange = (index: number, value: number) => {
    const newAllocations = [...allocations];
    newAllocations[index].budget = Number(value);

    const totalAllocated = newAllocations.reduce(
      (sum, allocation) => sum + Number(allocation.budget),
      0
    );
    if (totalAllocated > Number(budget)) {
      console.log("extrapolou");
      form.setError(`allocations.${index}.budget`, {
        type: "manual",
        message: "A soma das alocações não pode exceder o orçamento geral.",
      });
    } else {
      form.clearErrors(`allocations.${index}.budget`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
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
                      Ative para usar a API em lote, 50% de desconto.
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
                  <FormLabel>Orçamento Mensal</FormLabel>
                  <div className="flex flex-1 gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Insira seu orçamento"
                        className="flex-1"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          const totalAllocated = allocations.reduce(
                            (sum, allocation) =>
                              sum + Number(allocation.budget),
                            0.0
                          );
                          if (value < totalAllocated) {
                            form.setError("budget", {
                              type: "manual",
                              message:
                                "O orçamento geral não pode ser menor que a soma das alocações.",
                            });
                          } else {
                            field.onChange(value);
                            form.clearErrors("budget");
                          }
                        }}
                      />
                    </FormControl>
                    <Button type="button" onClick={addLine}>
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%]">Repositório</TableHead>
                    <TableHead className="w-[20%]">Orçamento</TableHead>
                    <TableHead className="w-[10%] text-right">%</TableHead>
                    <TableHead className="w-[10%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="max-w-0">
                        <FormField
                          control={form.control}
                          name={`allocations.${index}.repository`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um repositório" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[
                                    ...(repositories.filter(
                                      (repo) => repo.full_name == field.value
                                    ) || []),
                                    ...availableRepositories.filter(
                                      (repo) => repo.full_name != field.value
                                    ),
                                  ].map((repo) => (
                                    <SelectItem
                                      key={repo.full_name}
                                      value={repo.full_name}
                                    >
                                      <span className="block truncate">
                                        {repo.name}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`allocations.${index}.budget`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="w-full"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const value = parseFloat(e.target.value);
                                    handleBudgetChange(index, value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {(
                          ((Number(allocations[index]?.budget) || 0.0) /
                            Math.max(1.0, Number(budget))) *
                          100.0
                        ).toFixed(2)}
                        %
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="max-w-0 text-right">
                      <span className="block truncate">
                        Compartilhado com restante dos projetos
                      </span>
                    </TableCell>
                    <TableCell>
                      ${" "}
                      {(
                        Number(budget) -
                        allocations.reduce(
                          (acc, cur) => acc + Number(cur.budget),
                          0.0
                        )
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(
                        ((Number(budget) -
                          allocations.reduce(
                            (acc, cur) => acc + Number(cur.budget),
                            0.0
                          )) /
                          Math.max(1.0, Number(budget))) *
                        100.0
                      ).toFixed(2)}
                      %
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
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
