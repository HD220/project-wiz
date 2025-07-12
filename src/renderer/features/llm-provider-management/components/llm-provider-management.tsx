import { useState } from "react";
import { useLlmProviders } from "../hooks/use-llm-provider.hook";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LlmProviderFormModal } from "./llm-provider-form-modal";
import { LlmProviderDto } from "../../../../shared/types/llm-provider.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function LlmProviderManagement() {
  const { llmProviders, isLoading, error, deleteLlmProvider } = useLlmProviders();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LlmProviderDto | null>(null);

  const handleEdit = (provider: LlmProviderDto) => {
    setEditingProvider(provider);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProvider(null);
    setIsModalOpen(true);
  };

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
        <Button onClick={handleAddNew}>Adicionar Provedor</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {llmProviders.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>{provider.name}</TableCell>
                <TableCell>{provider.provider}</TableCell>
                <TableCell>{provider.model}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(provider)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteLlmProvider(provider.id)}
                    className="ml-2"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <LlmProviderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={editingProvider}
      />
    </Card>
  );
}
