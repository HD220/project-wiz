import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";

import { AddAgentAdvancedFields } from "./add-agent-advanced-fields";
import { AddAgentBasicFields } from "./add-agent-basic-fields";

interface AddAgentFormTabsProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  llmProviders: any[];
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
