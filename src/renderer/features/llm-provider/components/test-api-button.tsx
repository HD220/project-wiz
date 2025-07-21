import { useState } from "react";
import { Loader2, CheckCircle, XCircle, TestTube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLLMProvidersStore } from "@/renderer/store/llm-providers-store";
// Interface para os dados do teste
interface TestApiKeyData {
  type: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey: string;
  baseUrl?: string;
}
import { toast } from "sonner";

interface TestApiButtonProps {
  data: TestApiKeyData;
  disabled?: boolean;
  size?: "default" | "sm" | "lg";
}

export function TestApiButton({ data, disabled = false, size = "default" }: TestApiButtonProps) {
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const { testProvider, testingProvider } = useLLMProvidersStore();

  const isTesting = testingProvider !== null;

  const handleTest = async () => {
    setTestResult(null);
    
    try {
      const success = await testProvider(data);
      
      if (success) {
        setTestResult("success");
        toast.success("API key test successful!");
      } else {
        setTestResult("error");
        toast.error("API key test failed");
      }
      
      // Clear result after 3 seconds
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult("error");
      toast.error("API key test failed");
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const getButtonVariant = () => {
    if (testResult === "success") return "default";
    if (testResult === "error") return "destructive";
    return "outline";
  };

  const getButtonIcon = () => {
    if (isTesting) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (testResult === "success") return <CheckCircle className="h-4 w-4" />;
    if (testResult === "error") return <XCircle className="h-4 w-4" />;
    return <TestTube className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isTesting) return "Testing...";
    if (testResult === "success") return "Success!";
    if (testResult === "error") return "Failed";
    return "Test API";
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={size}
      onClick={handleTest}
      disabled={disabled || isTesting}
      className="gap-2"
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}