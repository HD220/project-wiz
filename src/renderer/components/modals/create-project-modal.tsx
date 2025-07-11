import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, GitBranch, Download } from "lucide-react";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [gitUrl, setGitUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement project creation logic
    console.log("Creating project:", {
      name: projectName,
      description: projectDescription,
      type: projectType,
      gitUrl,
    });
    onOpenChange(false);
    // Reset form
    setProjectName("");
    setProjectDescription("");
    setProjectType("");
    setGitUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Criar Novo Projeto
          </DialogTitle>
          <DialogDescription>
            Configure um novo projeto para começar a trabalhar com agentes de IA.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nome do Projeto</Label>
            <Input
              id="project-name"
              placeholder="Meu Projeto Incrível"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-description">Descrição</Label>
            <Textarea
              id="project-description"
              placeholder="Uma breve descrição do seu projeto..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-type">Tipo de Projeto</Label>
            <Select value={projectType} onValueChange={setProjectType} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Projeto Novo (Vazio)
                  </div>
                </SelectItem>
                <SelectItem value="existing">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Projeto Existente (Local)
                  </div>
                </SelectItem>
                <SelectItem value="git">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Clonar do Git
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {projectType === "git" && (
            <div className="space-y-2">
              <Label htmlFor="git-url">URL do Repositório Git</Label>
              <Input
                id="git-url"
                placeholder="https://github.com/usuario/repositorio.git"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!projectName || !projectType}>
              Criar Projeto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}