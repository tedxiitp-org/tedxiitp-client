"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Checkoutp1 from "./Checkoutp1";
import Checkoutp2 from "./Checkoutp2";
import Checkoutp3 from "./Checkoutp3";

export default function CheckoutRoute() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  // Safely increment steps (bound to max step 3)
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  
  // Safely decrement steps (bound to min step 1)
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  
  // Direct jump function (highly useful for step-indicator clicks)
  const goToStep = (stepNumber: number) => setStep(Math.min(Math.max(stepNumber, 1), 3));

  // Clear data and send home when transmission is finalized on page 3
  const handleComplete = () => {
    localStorage.clear();
    router.push("/");
  };

  // Dynamically switch views based on the step state value
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Checkoutp1 onNext={nextStep} onStepChange={goToStep} />;
      case 2:
        return <Checkoutp2 onNext={nextStep} onBack={prevStep} onStepChange={goToStep} />;
      case 3:
        return <Checkoutp3 onBack={prevStep} onStepChange={goToStep} onComplete={handleComplete} />;
      default:
        return <Checkoutp1 onNext={nextStep} onStepChange={goToStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white ">
      {renderStep()}
    </div>
  );
}
