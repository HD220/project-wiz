import { useMutation } from "@tanstack/react-query";
import { Loader2, CheckCircle, XCircle, TestTube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { IpcResponse } from "@/main/types";

import { Button } from "@/renderer/components/ui/button";

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

  // SIMPLE: Direct mutation with window.api
  const testProviderMutation = useMutation({
    mutationFn: (testData: TestApiKeyData) =>
      window.api.llmProviders.testApiKey(
        testData.type,
        testData.apiKey,
        testData.baseUrl,
      ),
  });

  const isTesting = testProviderMutation.isPending;

  function handleTest() {
    setTestResult(null);

    testProviderMutation.mutate(data, {
      onSuccess: (response: IpcResponse) => {
        if (response.success) {
          setTestResult("success");
          toast.success("API connection successful!");
        } else {
          setTestResult("error");
          toast.error("API connection failed");
        }
        // Clear result after 2.5 seconds
        setTimeout(() => setTestResult(null), 2500);
      },
      onError: () => {
        setTestResult("error");
        toast.error("API connection failed");
        setTimeout(() => setTestResult(null), 2500);
      },
    });
  }

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
