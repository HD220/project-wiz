import { Loader2, CheckCircle, XCircle, TestTube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/renderer/components/ui/button";

import { useTestLLMProvider } from "../hooks/use-llm-providers";

// Interface para os dados do teste
interface TestApiKeyData {
  type: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey: string;
  baseUrl?: string;
}

interface TestApiButtonProps {
  data: TestApiKeyData;
  disabled?: boolean;
  size?: "default" | "sm" | "lg";
}

function TestApiButton(props: TestApiButtonProps) {
  const { data, disabled = false, size = "default" } = props;
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null,
  );
  const testProviderMutation = useTestLLMProvider();

  const isTesting = testProviderMutation.isPending;

  const handleTest = async () => {
    setTestResult(null);

    try {
      const success = await testProviderMutation.mutateAsync(data);

      if (success) {
        setTestResult("success");
        toast.success("API connection successful!");
      } else {
        setTestResult("error");
        toast.error("API connection failed");
      }

      // Clear result after 2.5 seconds
      setTimeout(() => setTestResult(null), 2500);
    } catch (error) {
      setTestResult("error");
      toast.error("API connection failed");
      setTimeout(() => setTestResult(null), 2500);
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
    if (testResult === "success") return "Test Passed";
    if (testResult === "error") return "Test Failed";
    return "Test Connection";
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

export { TestApiButton };
