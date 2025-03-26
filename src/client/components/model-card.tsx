import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useState } from "react";

interface Model {
  id: number;
  name: string;
  modelId: string;
  size: string;
  status: string;
  lastUsed: string | null;
  description: string;
}

interface ModelCardProps {
  model: Model;
  isActive: boolean;
  onActivate: (modelId: string) => void;
}

export default function ModelCard({
  model,
  isActive,
  onActivate,
}: ModelCardProps) {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      // await window.electronAPI.downloadModel(
      //   model.modelId,
      //   (progress: number) => {
      //     setDownloadProgress(progress);
      //   }
      // );
      toast.success(`Modelo ${model.modelId} baixado com sucesso`);
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error(
        `Falha ao baixar o modelo ${model.modelId}: ${error.message}`
      );
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleActivate = () => {
    onActivate(model.modelId);
  };

  return (
    <Card className={isActive ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{model.name}</CardTitle>
          <Badge
            variant={
              model.status === "downloaded"
                ? isActive
                  ? "default"
                  : "secondary"
                : "outline"
            }
          >
            {model.status === "downloaded"
              ? isActive
                ? "Active"
                : "Downloaded"
              : "Not Downloaded"}
          </Badge>
        </div>
        <CardDescription>{model.modelId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">{model.description}</div>
        <div className="mt-2 text-xs text-muted-foreground">
          Size: {model.size}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Last used: {formatDate(model.lastUsed)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {model.status === "downloaded" ? (
          isActive ? (
            <Button
              size="sm"
              className="ml-auto w-48"
              variant="secondary"
              disabled
            >
              Active
            </Button>
          ) : (
            <Button size="sm" className="ml-auto w-48" onClick={handleActivate}>
              Activate
            </Button>
          )
        ) : (
          <Button
            size="sm"
            className="ml-auto w-48"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <div className="flex items-center gap-2 w-full">
                <Progress value={downloadProgress} className="h-2 w-full" />
                <span className="text-xs">{downloadProgress}%</span>
              </div>
            ) : (
              <>
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
                Download
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
