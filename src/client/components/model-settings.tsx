import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import ModelList from "./model-list";
import ModelConfiguration from "./model-configuration";
import { useAvailableModels } from "../hooks/use-available-models";
import { Trans } from "@lingui/macro";

// UI text constants for i18n
const UI_TEXT = {
  title: <Trans>Model Settings</Trans>,
  downloadButton: <Trans>Download New Model</Trans>,
  tabs: {
    models: <Trans>Available Models</Trans>,
    settings: <Trans>Model Configuration</Trans>,
    performance: <Trans>Performance</Trans>,
  },
  modelsDescription: (
    <Trans>
      Models available for download and use. Click "Download" to get a model or "Activate" to enable a downloaded model.
    </Trans>
  ),
  modelsHeader: <Trans>Available Models</Trans>,
  performanceTitle: <Trans>Performance Metrics</Trans>,
  performanceDescription: <Trans>Track model performance and resource usage over time</Trans>,
  performancePlaceholder: (
    <Trans>
      Performance data will be displayed here once the model is active.
    </Trans>
  ),
  viewFullReport: <Trans>View Full Report</Trans>,
  beta: <Trans>Beta</Trans>,
};

function ModelSettingsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold tracking-tight">{UI_TEXT.title}</h2>
      <Button>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {UI_TEXT.downloadButton}
      </Button>
    </div>
  );
}

function ModelsTab({ models }: { models: any[] }) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">{UI_TEXT.modelsDescription}</p>
      </div>
      <div className="border rounded-md">
        <div className="p-4 border-b bg-muted/50">
          <h3 className="font-medium">{UI_TEXT.modelsHeader}</h3>
        </div>
        <div>
          <ModelList models={models} />
        </div>
      </div>
    </div>
  );
}

function PerformancePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{UI_TEXT.performanceTitle}</CardTitle>
        <CardDescription>{UI_TEXT.performanceDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p>{UI_TEXT.performancePlaceholder}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">{UI_TEXT.viewFullReport}</Button>
        <Badge variant="secondary">{UI_TEXT.beta}</Badge>
      </CardFooter>
    </Card>
  );
}

export default function ModelSettings() {
  const { models, loading, error } = useAvailableModels();

  if (loading) {
    return <div className="p-4"><Trans>Loading models...</Trans></div>;
  }
  if (error) {
    return <div className="p-4 text-red-500"><Trans>Error loading models.</Trans></div>;
  }

  return (
    <div className="space-y-4">
      <ModelSettingsHeader />
      <Tabs defaultValue="models" className="w-full">
        <TabsList>
          <TabsTrigger value="models">{UI_TEXT.tabs.models}</TabsTrigger>
          <TabsTrigger value="settings">{UI_TEXT.tabs.settings}</TabsTrigger>
          <TabsTrigger value="performance">{UI_TEXT.tabs.performance}</TabsTrigger>
        </TabsList>
        <TabsContent value="models" className="space-y-4">
          <ModelsTab models={models} />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <ModelConfiguration models={models} />
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <PerformancePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
