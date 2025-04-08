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
import { useLLM } from "@/hooks/use-llm";
import ModelCard from "./model-card";
import ModelList from "./model-list";
import ModelConfiguration from "./model-configuration";
import PromptCustomization from "./prompt-customization";

export interface Model {
  id: number;
  name: string;
  modelId: string;
  size: string;
  status: string;
  lastUsed: string | null;
  description: string;
  modelType: "llama" | "mistral";
}

const defaultPrompts = {
  "prompt.initial": "Você é um assistente virtual.",
  "prompt.code": "Escreva um código em JavaScript.",
  "prompt.translate": "Traduza para o inglês.",
};

export default function ModelSettings() {
  const { loadModel } = useLLM();

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
      modelType: "mistral" as "mistral",
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
      modelType: "llama" as "llama",
    },
    {
      id: 3,
      name: "CodeLlama 7B",
      modelId: "codellama/CodeLlama-7b-hf",
      size: "7B parameters",
      status: "not-downloaded",
      lastUsed: null,
      description: "Specialized model for code generation and understanding.",
      modelType: "llama" as "llama",
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
      modelType: "llama" as "llama",
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
          <TabsTrigger value="prompts">Prompt Customization</TabsTrigger>
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
          <ModelConfiguration models={models} />
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <PromptCustomization
            modelId={"mistralai/Mistral-7B-v0.1"}
            prompts={defaultPrompts}
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Track model performance and resource usage over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                {/* Placeholder for performance charts and metrics */}
                <p>
                  Performance data will be displayed here once the model is
                  active.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {/* Add any relevant actions or links here */}
              <Button variant="outline">View Full Report</Button>
              <Badge variant="secondary">Beta</Badge>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
