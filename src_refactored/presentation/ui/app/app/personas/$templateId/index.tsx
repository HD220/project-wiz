import {
  createFileRoute,
  Link,
  useParams,
} from '@tanstack/react-router';
import { Edit3, ArrowLeft, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TemplateHeader } from '@/ui/features/persona/components/details/TemplateHeader';
import { TemplateLoading } from '@/ui/features/persona/components/details/TemplateLoading';
import { TemplateNotFound } from '@/ui/features/persona/components/details/TemplateNotFound';
import { TemplateSection } from '@/ui/features/persona/components/details/TemplateSection';
import { TemplateTools } from '@/ui/features/persona/components/details/TemplateTools';
import { PersonaTemplate } from '@/ui/features/persona/components/PersonaTemplateListItem';

// Mock Data
const mockPersonaTemplates: Record<string, PersonaTemplate> = {
  templateId1: {
    id: '1',
    name: 'Engenheiro de Software Sênior',
    role: 'Desenvolvedor especialista em arquiteturas complexas e refatoração de código.',
    goal: 'Escrever código limpo, eficiente, bem documentado e testado. Mentorar desenvolvedores juniores.',
    backstory:
      '15 anos de experiência em diversas linguagens e paradigmas. Contribuidor ativo de projetos open-source e palestrante em conferências de tecnologia. Prefere abordagens pragmáticas e baseadas em dados para resolução de problemas.',
    toolNames: [
      'filesystem',
      'terminal',
      'codeEditor',
      'search',
      'gitClient',
      'debugger',
    ],
  },
  templateId2: {
    id: '2',
    name: 'Analista de QA Detalhista',
    role: 'Especialista em testes de software, focado em encontrar bugs críticos e garantir a qualidade.',
    goal: 'Garantir que o software atenda aos mais altos padrões de qualidade antes do lançamento. Criar planos de teste abrangentes e automatizar cenários de regressão.',
    backstory:
      'Apaixonado por qualidade e processos de teste desde o início da carreira. Certificado em ISTQB Advanced Level.',
    toolNames: ['testRunner', 'issueTracker', 'browserDevTools', 'apiClient'],
  },
  templateId3: {
    id: '3',
    name: 'Gerente de Projetos Ágil',
    role: 'Facilitador de equipes ágeis, focado em entregas de valor e comunicação eficiente.',
    goal: 'Manter o projeto nos trilhos, remover impedimentos, gerenciar o backlog e garantir a satisfação do cliente e da equipe.',
    backstory:
      'Experiência como Scrum Master e Product Owner em startups e grandes corporações. Forte habilidade em comunicação e resolução de conflitos.',
    toolNames: [
      'taskManager',
      'ganttChart',
      'communicationTools',
      'reportingTool',
    ],
  },
};

function PersonaTemplateDetailPage() {
  const params = useParams({ from: '/(app)/personas/$templateId/' });
  const templateId = params.templateId;
  const [template, setTemplate] = useState<PersonaTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundTemplate = mockPersonaTemplates[templateId];
      setTemplate(foundTemplate || null);
      setIsLoading(false);
      if (!foundTemplate) {
        toast.error(
          `Template de Persona com ID "${templateId}" não encontrado.`,
        );
      }
    }, 300);
  }, [templateId]);

  if (isLoading) {
    return <TemplateLoading />;
  }

  if (!template) {
    return <TemplateNotFound />;
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
          <Link
            to="/personas/$templateId/edit"
            params={{ templateId: template.id }}
          >
            <Edit3 className="mr-2 h-4 w-4" /> Editar Template
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <TemplateHeader name={template.name} role={template.role} />
        <CardContent className="p-6 space-y-5">
          <div className="pt-1">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Objetivo Principal
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
              {template.goal}
            </p>
          </div>

          <TemplateSection
            title="Backstory / Contexto"
            content={template.backstory}
          />

          <TemplateSection title="Ferramentas Permitidas">
            <TemplateTools toolNames={template.toolNames} />
          </TemplateSection>

          {(template.backstory ||
            (template.toolNames && template.toolNames.length > 0)) && (
            <Separator />
          )}

          <div className="flex justify-end pt-1">
            <Button
              variant="default"
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              asChild
            >
              <Link to="/agents/new" search={{ templateId: template.id }}>
                <Zap className="mr-2 h-4 w-4" /> Criar Agente com este Template
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/app/personas/$templateId/')({
  component: PersonaTemplateDetailPage,
});

