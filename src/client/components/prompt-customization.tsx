import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useLLM } from "@/hooks/use-llm";

interface Props {
  modelId: string;
  prompts: { [key: string]: string };
}

export default function PromptCustomization({ modelId, prompts }: Props) {
  const [customPrompts, setCustomPrompts] = useState(prompts);
  const { loadModel } = useLLM();

  useEffect(() => {
    // Load prompts from local storage when the component mounts
    (window as any).electronAPI
      .loadPrompts({ modelId })
      .then((loadedPrompts: { [key: string]: string }) => {
        if (loadedPrompts) {
          setCustomPrompts(loadedPrompts);
        }
      });
  }, [modelId]);

  const handlePromptChange = (key: string, value: string) => {
    setCustomPrompts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Customization</CardTitle>
        <CardDescription>
          Customize the prompts used by the LLM.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(prompts).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{key}</Label>
            <Textarea
              id={key}
              value={customPrompts[key] || ""}
              onChange={(e) => handlePromptChange(key, e.target.value)}
            />
          </div>
        ))}
        <Button
          onClick={() => {
            (window as any).electronAPI.savePrompts({
              modelId,
              prompts: customPrompts,
            });
          }}
        >
          Save Prompts
        </Button>
      </CardContent>
    </Card>
  );
}
