import { Link } from "@tanstack/react-router";
import { Zap, Star, StarOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useLlmProviders } from "../hooks/use-llm-provider.hook";

export function LlmProviderManagement() {
  const {
    llmProviders,
    isLoading,
    error,
    deleteLlmProvider,
    setDefaultProvider,
  } = useLlmProviders();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Provedores de LLM
        </CardTitle>
        <Link to="/settings/new-llm-provider">
          <Button>Adicionar Provedor</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {llmProviders.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">
                  {provider.name}
                  {provider.isDefault && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      Padrao
                    </span>
                  )}
                </TableCell>
                <TableCell>{provider.provider}</TableCell>
                <TableCell>{provider.model}</TableCell>
                <TableCell>
                  <Button
                    variant={provider.isDefault ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDefaultProvider(provider.id)}
                    disabled={provider.isDefault}
                    className="flex items-center gap-1"
                  >
                    {provider.isDefault ? (
                      <Star className="w-3 h-3 fill-current" />
                    ) : (
                      <StarOff className="w-3 h-3" />
                    )}
                    {provider.isDefault ? "Padrao" : "Definir como padrao"}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link
                      to="/settings/edit-llm-provider/$llmProviderId"
                      params={{ llmProviderId: provider.id }}
                    >
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteLlmProvider(provider.id)}
                      disabled={provider.isDefault}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
