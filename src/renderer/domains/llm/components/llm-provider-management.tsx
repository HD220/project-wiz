import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody } from "../../../components/ui/table";
import { useLlmProviders } from "../hooks/use-llm-provider.hook";

import { LlmProviderHeader } from "./llm-provider-header";
import { LlmProviderRow } from "./llm-provider-row";
import { LlmProviderTableHeader } from "./llm-provider-table-header";

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
      <LlmProviderHeader />
      <CardContent>
        <Table>
          <LlmProviderTableHeader />
          <TableBody>
            {llmProviders.map((provider) => (
              <LlmProviderRow
                key={provider.id}
                provider={provider}
                onDelete={deleteLlmProvider}
                onSetDefault={setDefaultProvider}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
