"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, ArrowDown, ArrowRight } from "lucide-react";

interface FlowStep {
  id: string;
  title: string;
  description: string;
  formula?: string;
  example?: string;
  position: { x: number; y: number };
  type: "process" | "data" | "calculation";
}

const flowSteps: FlowStep[] = [
  {
    id: "step1",
    title: "Choose Primes",
    description: "Select two prime numbers",
    example: "p = 11, q = 13",
    position: { x: 50, y: 20 },
    type: "process",
  },
  {
    id: "step2",
    title: "Calculate n",
    description: "Multiply primes",
    formula: "n = p × q",
    example: "n = 11 × 13 = 143",
    position: { x: 50, y: 35 },
    type: "calculation",
  },
  {
    id: "step3",
    title: "Calculate φ(n)",
    description: "Euler's totient function",
    formula: "φ(n) = (p-1)(q-1)",
    example: "φ(143) = 10 × 12 = 120",
    position: { x: 50, y: 50 },
    type: "calculation",
  },
  {
    id: "step4",
    title: "Choose e",
    description: "Public exponent",
    formula: "gcd(e, φ(n)) = 1",
    example: "e = 7 (since gcd(7,120) = 1)",
    position: { x: 50, y: 65 },
    type: "process",
  },
  {
    id: "step5",
    title: "Calculate d",
    description: "Private exponent",
    formula: "e × d ≡ 1 (mod φ(n))",
    example: "7 × d ≡ 1 (mod 120), d = 103",
    position: { x: 50, y: 80 },
    type: "calculation",
  },
  {
    id: "encrypt",
    title: "Encrypt",
    description: "Encrypt message M",
    formula: "C = M^e mod n",
    example: "C = 42^7 mod 143 = 123",
    position: { x: 20, y: 95 },
    type: "process",
  },
  {
    id: "decrypt",
    title: "Decrypt",
    description: "Decrypt ciphertext C",
    formula: "M = C^d mod n",
    example: "M = 123^103 mod 143 = 42",
    position: { x: 80, y: 95 },
    type: "process",
  },
];

const connections = [
  { from: "step1", to: "step2" },
  { from: "step2", to: "step3" },
  { from: "step3", to: "step4" },
  { from: "step4", to: "step5" },
  { from: "step5", to: "encrypt" },
  { from: "step5", to: "decrypt" },
];

export function RSAFlowDiagram() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentStep < flowSteps.length) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= flowSteps.length - 1) {
            setIsPlaying(false);
            setIsComplete(true);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (isComplete) {
      setCurrentStep(0);
      setIsComplete(false);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsComplete(false);
  };

  const getStepStatus = (index: number) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "pending";
  };

  const getStepColor = (status: string, type: string) => {
    if (status === "completed")
      return "bg-green-100 border-green-300 text-green-800";
    if (status === "active")
      return "bg-blue-100 border-blue-300 text-blue-800 animate-pulse";
    if (type === "process") return "bg-blue-50 border-blue-200 text-blue-600";
    if (type === "calculation")
      return "bg-purple-50 border-purple-200 text-purple-600";
    return "bg-gray-50 border-gray-200 text-gray-600";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            RSA Algorithm Flow Diagram
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              size="sm"
              variant="outline"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button onClick={handleReset} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Interactive visualization of the RSA key generation and
          encryption/decryption process
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-4 overflow-hidden">
          {/* Flow Steps */}
          {flowSteps.map((step, index) => {
            const status = getStepStatus(index);
            const isEncryptDecrypt =
              step.id === "encrypt" || step.id === "decrypt";

            return (
              <div
                key={step.id}
                className={`absolute transition-all duration-500 ${
                  isEncryptDecrypt ? "w-40" : "w-48"
                }`}
                style={{
                  left: `${step.position.x}%`,
                  top: `${step.position.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className={`p-3 rounded-lg border-2 transition-all duration-300 ${getStepColor(
                    status,
                    step.type
                  )}`}
                >
                  <div className="font-semibold text-sm mb-1">{step.title}</div>
                  <div className="text-xs mb-2">{step.description}</div>
                  {step.formula && (
                    <div className="text-xs font-mono bg-white/50 p-1 rounded mb-1">
                      {step.formula}
                    </div>
                  )}
                  {step.example && status === "active" && (
                    <div className="text-xs font-mono bg-yellow-100 p-1 rounded border border-yellow-300">
                      {step.example}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Arrows/Connections */}
          {connections.map((conn, index) => {
            const fromStep = flowSteps.find((s) => s.id === conn.from);
            const toStep = flowSteps.find((s) => s.id === conn.to);

            if (!fromStep || !toStep) return null;

            const fromIndex = flowSteps.findIndex((s) => s.id === conn.from);
            const isVisible = currentStep > fromIndex;

            // Calculate if it's a vertical or horizontal arrow
            const isVertical =
              Math.abs(fromStep.position.y - toStep.position.y) > 5;
            const isBranching = conn.from === "step5"; // step5 branches to encrypt/decrypt

            return (
              <div
                key={`${conn.from}-${conn.to}`}
                className={`absolute transition-opacity duration-500 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
                style={
                  isBranching
                    ? {
                        left: `${fromStep.position.x}%`,
                        top: `${fromStep.position.y + 5}%`,
                        transform: "translate(-50%, 0)",
                      }
                    : {
                        left: `${fromStep.position.x}%`,
                        top: `${fromStep.position.y + 7}%`,
                        transform: "translate(-50%, 0)",
                      }
                }
              >
                {isBranching ? (
                  <div className="flex items-center gap-8">
                    <div className="flex items-center">
                      <ArrowDown className="w-4 h-4 text-blue-500 animate-bounce" />
                      <ArrowRight className="w-4 h-4 text-blue-500 -ml-1" />
                    </div>
                    <div className="flex items-center">
                      <ArrowDown className="w-4 h-4 text-blue-500 animate-bounce" />
                      <ArrowRight className="w-4 h-4 text-blue-500 -ml-1" />
                    </div>
                  </div>
                ) : (
                  <ArrowDown className="w-5 h-5 text-blue-500 animate-bounce" />
                )}
              </div>
            );
          })}

          {/* Progress indicator */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/80 rounded-lg p-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>
                  {currentStep + 1} / {flowSteps.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStep + 1) / flowSteps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step Details */}
        {currentStep < flowSteps.length && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">
              Current Step: {flowSteps[currentStep].title}
            </h4>
            <p className="text-sm text-blue-700 mb-2">
              {flowSteps[currentStep].description}
            </p>
            {flowSteps[currentStep].formula && (
              <div className="text-sm font-mono bg-white p-2 rounded border mb-2">
                Formula: {flowSteps[currentStep].formula}
              </div>
            )}
            {flowSteps[currentStep].example && (
              <div className="text-sm font-mono bg-yellow-100 p-2 rounded border border-yellow-300">
                Example: {flowSteps[currentStep].example}
              </div>
            )}
          </div>
        )}

        {isComplete && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">
              🎉 RSA Algorithm Complete!
            </h4>
            <p className="text-sm text-green-700">
              You've seen the complete RSA workflow from key generation to
              encryption and decryption. Now you can try the interactive form
              above with these example values!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
