import { createFileRoute, useRouter } from '@tanstack/react-router';
// Added useState
import React, { useState } from 'react';
// For feedback on LLM save
import { toast } from 'sonner';

// Import type
import { LLMConfigFormData } from '@/presentation/ui/features/llm/components/LLMConfigForm';
import { InitialConfigStep } from '@/presentation/ui/features/onboarding/components/InitialConfigStep';
import { OnboardingWizard } from '@/presentation/ui/features/onboarding/components/OnboardingWizard';
import { WelcomeStep } from '@/presentation/ui/features/onboarding/components/WelcomeStep';

function OnboardingPageComponent() {
  const router = useRouter();
  const [isLLMConfigSaved, setIsLLMConfigSaved] = useState(false);
  const [isSubmittingLLM, setIsSubmittingLLM] = useState(false);


  const handleLLMConfigSaved = (data: LLMConfigFormData) => {
    // This callback is triggered by InitialConfigStep when its form is submitted successfully
    console.log("LLM Config saved during onboarding:", data);
    // No toast here, as InitialConfigStep already shows one.
    setIsLLMConfigSaved(true);
    // The OnboardingWizard will typically handle navigation to the next step
    // or this component can trigger it if the wizard is controlled.
    // For now, we assume the wizard's "Next" button will become active or change behavior.
  };

  const handleFinishOnboarding = () => {
    if (!isLLMConfigSaved) {
      toast.error("Por favor, salve uma configuração LLM para continuar.");
      // Optionally, force navigation to the LLM config step if the wizard is complex
      // setCurrentStep('initial-config'); // This would require more state management in OnboardingWizard
      return;
    }
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
      content: (
        <InitialConfigStep
            onConfigSaved={handleLLMConfigSaved}
            isSubmitting={isSubmittingLLM}
            setIsSubmitting={setIsSubmittingLLM}
        />
      ),
    },
    {
      id: 'summary',
      title: 'Pronto para Começar!',
      content: (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Configuração Concluída!</h3>
          <p className="text-slate-700 dark:text-slate-300">
            {isLLMConfigSaved
              ? "Sua configuração LLM foi salva. Você está pronto para explorar o Project Wiz!"
              : "Quase lá! Complete a configuração do LLM para finalizar."}
          </p>
          {!isLLMConfigSaved && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                A configuração do LLM é necessária para prosseguir.
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-xl lg:max-w-2xl"> {/* Increased max-width for LLM form */}
        <OnboardingWizard
          steps={onboardingSteps}
          onFinish={handleFinishOnboarding}
          wizardTitle="Configuração do Project Wiz"
          // Pass a prop to disable "Next" on LLM step if not saved, or "Finish" on summary
          // This logic would need to be added to OnboardingWizard component itself.
          // For simplicity now, the summary step message and onFinish check handle it.
          // This logic would need to be added to OnboardingWizard component itself.
          isStepBlocked={ (stepId: string) => stepId === 'summary' && !isLLMConfigSaved }
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/(public)/onboarding/')({
  component: OnboardingPageComponent,
});
