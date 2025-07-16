import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { CardHeader, CardTitle } from "../../../components/ui/card";

export function LlmProviderHeader() {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Provedores de LLM
      </CardTitle>
      <Link to="/settings/new-llm-provider">
        <Button>Adicionar Provedor</Button>
      </Link>
    </CardHeader>
  );
}
