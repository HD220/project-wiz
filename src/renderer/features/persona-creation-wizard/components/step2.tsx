import React from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";

interface Step2Props {
  llmModel: string;
  setLlmModel: (model: string) => void;
  llmTemperature: number;
  setLlmTemperature: (temperature: number) => void;
  tools: string;
  setTools: (tools: string) => void;
  handleBack: () => void;
  loading: boolean;
}

export function Step2({
  llmModel,
  setLlmModel,
  llmTemperature,
  setLlmTemperature,
  tools,
  setTools,
  handleBack,
  loading,
}: Step2Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="llmModel">LLM Model</Label>
        <Select value={llmModel} onValueChange={setLlmModel}>
          <SelectTrigger>
            <SelectValue placeholder="Select an LLM model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="llmTemperature">Temperature</Label>
        <Input
          type="number"
          id="llmTemperature"
          value={llmTemperature}
          onChange={(e) => setLlmTemperature(parseFloat(e.target.value))}
          step="0.1"
          min="0"
          max="1"
        />
      </div>
      <div>
        <Label htmlFor="tools">Tools (comma-separated)</Label>
        <Input
          id="tools"
          value={tools}
          onChange={(e) => setTools(e.target.value)}
          placeholder="tool1, tool2"
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Persona"}
        </Button>
      </div>
    </div>
  );
}
