import React, { useState, ReactNode } from 'react';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { Progress } from '@/presentation/ui/components/ui/progress';

interface OnboardingStep {
  id: string;
  title: string;
  content: ReactNode;
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onFinish: () => void;
  wizardTitle?: string;
  isStepBlocked?: (stepId: string, currentStepIndex: number) => boolean; // Optional: to block next/finish
}

export function OnboardingWizard({
  steps,
  onFinish,
  wizardTitle = "Onboarding",
  isStepBlocked
}: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];
  const progressValue = ((currentStepIndex + 1) / steps.length) * 100;

  // Determine if the current step should block progression
  const isBlocked = isStepBlocked ? isStepBlocked(currentStep.id, currentStepIndex) : false;

  const goToNextStep = () => {
    if (isBlocked && currentStepIndex < steps.length - 1) { // Check if current step is blocked for "Next"
        // Optionally show a message, but parent component (OnboardingPage) shows toast for LLM
        return;
    }
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleFinishClick = () => {
    if (isBlocked) { // Check if current step (likely summary) is blocked for "Finish"
         // Parent (OnboardingPage) handles the specific toast message for LLM config not saved
        return;
    }
    onFinish();
  }


  if (!currentStep) {
    return <div>Error: No current step defined.</div>;
  }

  // Determine if the "Next" or "Finish" button should be disabled
  // The "Next" button is disabled if the current step is blocked by the isStepBlocked condition.
  // The "Finish" button is also disabled if the current (last) step is blocked.
  const isNextButtonDisabled = isBlocked && (currentStepIndex < steps.length - 1);
  const isFinishButtonDisabled = isBlocked && (currentStepIndex === steps.length - 1);


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{wizardTitle}</CardTitle>
        <CardDescription>{currentStep.title} (Etapa {currentStepIndex + 1} de {steps.length})</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px] md:min-h-[300px] py-6 flex flex-col justify-center"> {/* Increased min-height */}
        {currentStep.content}
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4 pt-6">
        <Progress value={progressValue} className="w-full mb-4" />
        <div className="flex w-full justify-between">
          <Button variant="outline" onClick={goToPreviousStep} disabled={currentStepIndex === 0}>
            Anterior
          </Button>
          {currentStepIndex < steps.length - 1 ? (
            <Button onClick={goToNextStep} disabled={isNextButtonDisabled}>
              Próximo
            </Button>
          ) : (
            <Button onClick={handleFinishClick} disabled={isFinishButtonDisabled}>
              Finalizar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
