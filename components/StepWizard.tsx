import React from 'react';
import { AppStep } from '../types';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

interface StepWizardProps {
  currentStep: AppStep;
}

const steps = [
  { id: AppStep.PROFILING, label: "Profile" },
  { id: AppStep.ASSESSMENT_INTERESTS, label: "Interests" },
  { id: AppStep.ASSESSMENT_SKILLS, label: "Skills" },
  { id: AppStep.ASSESSMENT_VALUES, label: "Values" },
  { id: AppStep.RESULTS, label: "Results" },
];

export const StepWizard: React.FC<StepWizardProps> = ({ currentStep }) => {
  // Helper to determine active index
  const getStepIndex = (step: AppStep) => {
    // Treat loading/analyzing as the step before Results for visual continuity
    if (step === AppStep.ANALYZING) return 3; 
    if (step === AppStep.CHAT) return 4;
    return steps.findIndex(s => s.id === step);
  };

  const currentIndex = getStepIndex(currentStep);

  if (currentStep === AppStep.WELCOME) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
        {/* Active Progress Bar */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-500 -z-10 transition-all duration-500 ease-in-out" 
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center bg-gray-50 rounded-full">
              <div 
                className={`
                  w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 
                  transition-colors duration-300
                  ${isActive ? 'border-amber-500 bg-amber-50 text-amber-600' : ''}
                  ${isCompleted ? 'border-amber-500 bg-amber-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'border-gray-300 bg-white text-gray-400' : ''}
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 size={20} />
                ) : isActive ? (
                   <Sparkles size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </div>
              <span className={`text-xs mt-2 font-medium ${isActive || isCompleted ? 'text-gray-800' : 'text-gray-400'} hidden md:block`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
