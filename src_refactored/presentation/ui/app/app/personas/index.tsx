import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusCircle, UserSquare, Search } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonaTemplateList } from "@/ui/features/persona/components/PersonaTemplateList";
import { PersonaTemplate } from "@/ui/features/persona/components/PersonaTemplateListItem";

// Mock Data
const mockPersonaTemplates: PersonaTemplate[] = [
  {
    id: "1",
    name: "Engenheiro de Software Sênior",
    role: "Desenvolvedor especialista em arquiteturas complexas e refatoração de código.",
    goal: "Escrever código limpo, eficiente, bem documentado e testado. Mentorar desenvolvedores juniores.",
    backstory: "15 anos de experiência em diversas linguagens e paradigmas.",
    toolNames: ["filesystem", "terminal", "code-editor", "search"],
  },
  {
    id: "2",
    name: "Analista de QA Detalhista",
    role: "Especialista em testes de software, focado em encontrar bugs críticos e garantir a qualidade.",
    goal: "Garantir que o software atenda aos mais altos padrões de qualidade antes do lançamento. Criar planos de teste abrangentes.",
    backstory:
      "Apaixonado por qualidade e processos de teste desde o início da carreira.",
    toolNames: ["test-runner", "issue-tracker", "browser-dev-tools"],
  },
  {
    id: "3",
    name: "Gerente de Projetos Ágil",
    role: "Facilitador de equipes ágeis, focado em entregas de valor e comunicação eficiente.",
    goal: "Manter o projeto nos trilhos, remover impedimentos e garantir a satisfação do cliente e da equipe.",
    backstory:
      "Experiência como Scrum Master e Product Owner em startups e grandes corporações.",
    toolNames: ["task-manager", "gantt-chart", "communication-tools"],
  },
  {
    id: "4",
    name: "Redator Técnico Criativo",
    role: "Escritor especializado em transformar informações técnicas complexas em conteúdo claro e envolvente.",
    goal: "Produzir documentação de alta qualidade, tutoriais e guias de usuário que sejam fáceis de entender.",
    backstory: "Background em jornalismo e paixão por tecnologia.",
    toolNames: [
      "markdown-editor",
      "documentation-generator",
      "screenshot-tool",
    ],
  },
];

function PersonaTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTemplates = mockPersonaTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center">
            <UserSquare className="mr-3 h-8 w-8 text-sky-600 dark:text-sky-500" />
            Gerenciador de Personas (Templates)
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Crie, visualize e gerencie templates para seus Agentes IA.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/personas/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Persona
          </Link>
        </Button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
        <Input
          type="search"
          placeholder="Buscar por nome da persona, papel ou objetivo..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="pl-10 w-full md:w-1/2 lg:w-1/3"
        />
      </div>

      {filteredTemplates.length > 0 ? (
        <PersonaTemplateList templates={filteredTemplates} />
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg mt-6">
          <Bot className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-50">
            {searchTerm
              ? "Nenhuma persona encontrada"
              : "Nenhuma persona criada"
            }
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchTerm
              ? "Tente ajustar seus termos de busca."
              : "Comece criando sua primeira persona."
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link to="/app/personas/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Nova Persona
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/app/personas/")({
  component: PersonaTemplatesPage,
});
