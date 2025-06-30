import { createFileRoute, Link } from '@tanstack/react-router';
import { User, Cpu, Palette, Bell, ShieldCheck } from 'lucide-react'; // Icons for sections
import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { Separator } from '@/presentation/ui/components/ui/separator';

interface SettingsSectionProps {
  to: string;
  icon: React.ElementType;
  title: string;
  description: string;
  disabled?: boolean;
}

function SettingsSectionLink({ to, icon: iconProp, title, description, disabled }: SettingsSectionProps) { // Renamed icon prop to satisfy convention
  const content = (
    <div className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
      disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
    }`}>
      <div className={`mt-1 p-2 rounded-md ${disabled ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}>
        {iconProp && React.createElement(iconProp, { className: `h-6 w-6 ${disabled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}` })}
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );

  if (disabled) {
    return <div title={`${title} (Em breve)`}>{content}</div>;
  }

  return (
    <Link to={to} className="block">
      {content}
    </Link>
  );
}


function SettingsPage() {
  const settingsSections: SettingsSectionProps[] = [
    {
      to: '/settings/profile',
      icon: User,
      title: 'Perfil',
      description: 'Gerencie suas informações de perfil e preferências pessoais.',
      disabled: true, // Placeholder until page is created
    },
    {
      to: '/settings/llm',
      icon: Cpu,
      title: 'Provedores LLM',
      description: 'Configure e gerencie suas conexões com Modelos de Linguagem (LLMs).',
    },
    {
      to: '/settings/appearance',
      icon: Palette,
      title: 'Aparência',
      description: 'Personalize o tema e a aparência da aplicação.',
      disabled: true, // Placeholder
    },
    {
      to: '/settings/notifications',
      icon: Bell,
      title: 'Notificações',
      description: 'Defina suas preferências de notificação.',
      disabled: true, // Placeholder
    },
     {
      to: '/settings/security',
      icon: ShieldCheck,
      title: 'Segurança & Conta',
      description: 'Gerencie configurações de segurança, autenticação e dados da conta.',
      disabled: true, // Placeholder
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Configurações
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Gerencie as configurações da sua conta e da aplicação Project Wiz.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Categorias de Configuração</CardTitle>
          <CardDescription>
            Navegue pelas diferentes seções para ajustar suas preferências.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0"> {/* Remove default padding to let links handle it */}
          <div className="grid grid-cols-1">
            {settingsSections.map((section, index) => (
              <React.Fragment key={section.to}>
                <SettingsSectionLink {...section} />
                {index < settingsSections.length - 1 && <Separator className="my-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/(app)/settings/')({
  component: SettingsPage,
});
