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
}

export function OnboardingWizard({ steps, onFinish, wizardTitle = "Onboarding" }: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const goToNextStep = () => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const currentStep = steps[currentStepIndex];
  const progressValue = ((currentStepIndex + 1) / steps.length) * 100;

  if (!currentStep) {
    return <div>Error: No current step defined.</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{wizardTitle}</CardTitle>
        <CardDescription>{currentStep.title}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[200px] flex flex-col justify-center">
        {currentStep.content}
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        <Progress value={progressValue} className="w-full mb-4" />
        <div className="flex w-full justify-between">
          <Button variant="outline" onClick={goToPreviousStep} disabled={currentStepIndex === 0}>
            Anterior
          </Button>
          {currentStepIndex < steps.length - 1 ? (
            <Button onClick={goToNextStep}>
              Próximo
            </Button>
          ) : (
            <Button onClick={onFinish}>
              Finalizar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
