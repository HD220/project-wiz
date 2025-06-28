import { createFileRoute, useRouter } from '@tanstack/react-router';
import React from 'react';

import { InitialConfigStep } from '@/presentation/ui/features/onboarding/components/InitialConfigStep';
import { OnboardingWizard } from '@/presentation/ui/features/onboarding/components/OnboardingWizard';
import { WelcomeStep } from '@/presentation/ui/features/onboarding/components/WelcomeStep';

function OnboardingPageComponent() {
  const router = useRouter();

  const handleFinishOnboarding = () => {
    // Navigate to a default authenticated route, e.g., '/dashboard'
    // This assumes '/dashboard' will be created and accessible after onboarding.
    router.navigate({ to: '/dashboard', replace: true });
  };

  // Define the steps for the wizard
  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Project Wiz!',
      content: <WelcomeStep />,
    },
    {
      id: 'initial-config',
      title: 'Configuração Inicial Essencial',
      content: <InitialConfigStep />, // Placeholder for now
    },
    {
      id: 'summary', // A final summary/confirmation step
      title: 'Pronto para Começar!',
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-2">Configuração Concluída!</h3>
          <p className="text-slate-700 dark:text-slate-300">
            Você está pronto para explorar o Project Wiz. Clique em "Finalizar" para
            ir ao seu dashboard.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-xl"> {/* Increased max-width for better content fit */}
        <OnboardingWizard
          steps={onboardingSteps}
          onFinish={handleFinishOnboarding}
          wizardTitle="Configuração do Project Wiz"
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/(public)/onboarding/')({
  component: OnboardingPageComponent,
});
