import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import ModelCard from "./model-card";
import ModelList from "./model-list";

export default function ModelSettings() {
  const [modelId, setModelId] = useState("mistralai/Mistral-7B-v0.1");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [memoryLimit, setMemoryLimit] = useState(8);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const models = [
    {
      id: 1,
      name: "Mistral 7B",
      modelId: "mistralai/Mistral-7B-v0.1",
      size: "7B parameters",
      status: "downloaded",
      lastUsed: "2023-06-15T10:42:00",
      description:
        "A powerful 7B parameter model with strong coding capabilities.",
    },
    {
      id: 2,
      name: "Llama 2 7B",
      modelId: "meta-llama/Llama-2-7b-hf",
      size: "7B parameters",
      status: "downloaded",
      lastUsed: "2023-06-14T15:30:00",
      description:
        "Meta's Llama 2 model with 7B parameters, good for general tasks.",
    },
    {
      id: 3,
      name: "CodeLlama 7B",
      modelId: "codellama/CodeLlama-7b-hf",
      size: "7B parameters",
      status: "not-downloaded",
      lastUsed: null,
      description: "Specialized model for code generation and understanding.",
    },
    {
      id: 4,
      name: "Phi-2",
      modelId: "microsoft/phi-2",
      size: "2.7B parameters",
      status: "downloaded",
      lastUsed: "2023-06-10T09:15:00",
      description:
        "Smaller but efficient model from Microsoft, good for lightweight tasks.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Model Settings</h2>
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
          Download New Model
        </Button>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList>
          <TabsTrigger value="models">Available Models</TabsTrigger>
          <TabsTrigger value="settings">Model Configuration</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          {/* Usando o componente ModelList para exibir os modelos */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Modelos disponíveis para download e uso. Clique em "Download" para
              baixar um modelo ou "Activate" para ativar um modelo já baixado.
            </p>
          </div>

          {/* Importando o componente ModelList que contém os modelos de exemplo */}
          <div className="border rounded-md">
            <div className="p-4 border-b bg-muted/50">
              <h3 className="font-medium">Modelos Disponíveis</h3>
            </div>
            <div>
              {/* Componente que lista os modelos, incluindo o modelo simples para teste */}
              <ModelList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>
                Configure parameters for the active model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-select">Active Model</Label>
                <Select value={modelId} onValueChange={setModelId}>
                  <SelectTrigger id="model-select">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models
                      .filter((model) => model.status === "downloaded")
                      .map((model) => (
                        <SelectItem key={model.id} value={model.modelId}>
                          {model.name} ({model.modelId})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature">
                    Temperature: {temperature}
                  </Label>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {temperature}
                  </span>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness: Lower values are more deterministic,
                  higher values more creative.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {maxTokens}
                  </span>
                </div>
                <Slider
                  id="max-tokens"
                  min={256}
                  max={4096}
                  step={256}
                  value={[maxTokens]}
                  onValueChange={(value) => setMaxTokens(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of tokens to generate in a single response.
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="memory-limit">
                    Memory Limit (GB): {memoryLimit}
                  </Label>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {memoryLimit}GB
                  </span>
                </div>
                <Slider
                  id="memory-limit"
                  min={4}
                  max={16}
                  step={1}
                  value={[memoryLimit]}
                  onValueChange={(value) => setMemoryLimit(value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum memory allocation for the model.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-update">
                    Automatically Update Models
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Download model updates when available
                  </p>
                </div>
                <Switch
                  id="auto-update"
                  checked={autoUpdate}
                  onCheckedChange={setAutoUpdate}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Configuration</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>
                Monitor resource usage and model performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Memory Usage</Label>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>45% (4.5GB / 10GB)</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View Details
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label>CPU Usage</Label>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30%</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View Details
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label>Response Time</Label>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: "80%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Average: 1.2s</span>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View Details
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">
                  Performance History
                </h3>
                <div className="bg-muted rounded-md p-4 h-48 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto mb-2"
                    >
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                    <p>Performance metrics chart will appear here</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset Statistics</Button>
              <Button>Generate Report</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
