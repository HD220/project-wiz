import { createFileRoute, useParams, Link, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Edit3, UserSquare, Settings, Zap, Brain, MessageSquare, BookText, FolderCog, TerminalSquare, SearchCode, TestTubeDiagonal, Bug, Presentation, Palette, FileText, Camera, ListChecks } from 'lucide-react'; // Added more icons
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/presentation/ui/components/ui/badge';
import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { Separator } from '@/presentation/ui/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/ui/components/ui/tooltip';
import { PersonaTemplate } from '@/presentation/ui/features/persona/components/PersonaTemplateListItem';

// Mock Data - Reuse from Persona list page or define a more detailed one here if needed
const mockPersonaTemplates: Record<string, PersonaTemplate> = {
  templateId1: { id: '1', name: 'Engenheiro de Software Sênior', role: 'Desenvolvedor especialista em arquiteturas complexas e refatoração de código.', goal: 'Escrever código limpo, eficiente, bem documentado e testado. Mentorar desenvolvedores juniores.', backstory: '15 anos de experiência em diversas linguagens e paradigmas. Contribuidor ativo de projetos open-source e palestrante em conferências de tecnologia. Prefere abordagens pragmáticas e baseadas em dados para resolução de problemas.', toolNames: ['filesystem', 'terminal', 'codeEditor', 'search', 'gitClient', 'debugger'] }, // Keys changed for ESLint
  templateId2: { id: '2', name: 'Analista de QA Detalhista', role: 'Especialista em testes de software, focado em encontrar bugs críticos e garantir a qualidade.', goal: 'Garantir que o software atenda aos mais altos padrões de qualidade antes do lançamento. Criar planos de teste abrangentes e automatizar cenários de regressão.', backstory: 'Apaixonado por qualidade e processos de teste desde o início da carreira. Certificado em ISTQB Advanced Level.', toolNames: ['testRunner', 'issueTracker', 'browserDevTools', 'apiClient'] }, // Keys changed
  templateId3: { id: '3', name: 'Gerente de Projetos Ágil', role: 'Facilitador de equipes ágeis, focado em entregas de valor e comunicação eficiente.', goal: 'Manter o projeto nos trilhos, remover impedimentos, gerenciar o backlog e garantir a satisfação do cliente e da equipe.', backstory: 'Experiência como Scrum Master e Product Owner em startups e grandes corporações. Forte habilidade em comunicação e resolução de conflitos.', toolNames: ['taskManager', 'ganttChart', 'communicationTools', 'reportingTool'] }, // Keys changed
};

// Tooltip Icon Map (consistent with PersonaTemplateListItem)
const toolIconMap: Record<string, React.ElementType> = {
  filesystem: FolderCog, terminal: TerminalSquare, codeEditor: Edit3, search: SearchCode,
  testRunner: TestTubeDiagonal, issueTracker: Bug, browserDevTools: Palette, taskManager: ListChecks,
  ganttChart: Presentation, communicationTools: MessageSquare, markdownEditor: FileText,
  documentationGenerator: BookText, screenshotTool: Camera, gitClient: Settings, // Placeholder for Git
  debugger: Settings, apiClient: Settings, reportingTool: Settings, default: Brain,
};

// START: Sub-components for PersonaTemplateDetailPage
interface TemplateHeaderProps {
  name: string;
  role: string;
}

function TemplateHeader({ name, role }: TemplateHeaderProps) {
  return (
    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6">
      <div className="flex items-start gap-4">
        <UserSquare className="h-12 w-12 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-1" />
        <div>
          <CardTitle className="text-2xl lg:text-3xl">{name}</CardTitle>
          <CardDescription className="text-sm lg:text-base mt-1">
            Papel: {role}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

interface TemplateSectionProps {
  title: string;
  content?: string | null;
  children?: React.ReactNode;
}

function TemplateSection({ title, content, children }: TemplateSectionProps) {
  if (!content && !children) return null;

  return (
    <>
      <Separator />
      <div>
        <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{title}</h3>
        {content && <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{content}</p>}
        {children}
      </div>
    </>
  );
}

interface TemplateToolsProps {
  toolNames?: string[];
}

function TemplateTools({ toolNames }: TemplateToolsProps) {
  if (!toolNames || toolNames.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider delayDuration={100}>
        {toolNames.map(toolName => {
          const lookupKey = toolName.replace(/-/g, '');
          const IconComponent = toolIconMap[lookupKey] || toolIconMap[toolName] || toolIconMap.default;
          return (
            <Tooltip key={toolName}>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-sm px-2.5 py-1">
                  <IconComponent className="h-3.5 w-3.5 mr-1.5 opacity-80" />
                  {toolName}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="text-xs p-1.5">
                Ferramenta: {toolName}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
// END: Sub-components for PersonaTemplateDetailPage


function PersonaTemplateDetailPage() {
  const params = useParams({ from: '/(app)/personas/$templateId/' });
  const templateId = params.templateId;
  const [template, setTemplate] = useState<PersonaTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundTemplate = mockPersonaTemplates[templateId];
      setTemplate(foundTemplate || null);
      setIsLoading(false);
      if (!foundTemplate) {
        toast.error(`Template de Persona com ID "${templateId}" não encontrado.`);
      }
    }, 300);
  }, [templateId]);

  if (isLoading) {
    return <div className="p-8 text-center">Carregando detalhes do template...</div>;
  }

  if (!template) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Template de Persona não encontrado</h2>
        <Button onClick={() => router.navigate({ to: '/personas' })} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Personas
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to="/personas">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
          </Link>
        </Button>
        <Button variant="default" asChild>
          <Link to="/personas/$templateId/edit" params={{templateId: template.id}}>
            <Edit3 className="mr-2 h-4 w-4" /> Editar Template
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <TemplateHeader name={template.name} role={template.role} />
        <CardContent className="p-6 space-y-5">
          {/* Render a base section for "Objetivo Principal" without a preceding Separator if it's the first one */}
          <div className="pt-1"> {/* Adjusted pt-1 to avoid a jump if it's the first, matching TemplateSection's potential separator */}
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Objetivo Principal</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{template.goal}</p>
          </div>

          <TemplateSection title="Backstory / Contexto" content={template.backstory} />

          <TemplateSection title="Ferramentas Permitidas">
            <TemplateTools toolNames={template.toolNames} />
          </TemplateSection>

          {/* Ensure a separator before the final button if content was rendered above */}
          {(template.backstory || (template.toolNames && template.toolNames.length > 0)) && <Separator />}

          <div className="flex justify-end pt-1"> {/* Added pt-1 to maintain spacing */}
            <Button variant="default" size="lg" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600" asChild>
                <Link to="/agents/new" search={{ templateId: template.id }}>
                    <Zap className="mr-2 h-4 w-4"/> Criar Agente com este Template
                </Link>
             </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/(app)/personas/$templateId/')({
  component: PersonaTemplateDetailPage,
});
