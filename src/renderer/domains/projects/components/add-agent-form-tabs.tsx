import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AddAgentAdvancedFields } from "./add-agent-advanced-fields";
import { AddAgentBasicFields } from "./add-agent-basic-fields";

import type { CreateAgentDto } from "../../../../shared/types/domains/agents/agent.types";
import type { LlmProviderDto } from "../../../../shared/types/domains/llm/llm-provider.types";

interface AddAgentFormTabsProps {
  formData: CreateAgentDto;
  updateField: (
    field: keyof CreateAgentDto,
    value: CreateAgentDto[keyof CreateAgentDto],
  ) => void;
  llmProviders: LlmProviderDto[];
}

export function AddAgentFormTabs({
  formData,
  updateField,
  llmProviders,
}: AddAgentFormTabsProps) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
        <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 mt-4">
        <AddAgentBasicFields
          formData={formData}
          updateField={updateField}
          llmProviders={llmProviders}
        />
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4 mt-4">
        <AddAgentAdvancedFields formData={formData} updateField={updateField} />
      </TabsContent>
    </Tabs>
  );
}
