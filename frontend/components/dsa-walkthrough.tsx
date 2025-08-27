"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Play,
  RotateCcw,
  FileText,
  Hash,
  Plus,
  Key,
  Lock,
  Unlock,
  Shield,
  CheckCircle,
  AlertTriangle,
  Pause,
} from "lucide-react";

interface DSAStep {
  id: string;
  title: string;
  description: string;
  formula: string;
  example: string;
  icon: React.ComponentType<any>;
  color: string;
  step: string;
}

const dsaSteps: DSAStep[] = [
  {
    id: "step1",
    title: "Original Message (M)",
    description: "Start with the plaintext message that needs to be signed",
    formula: "M = Original Message",
    example: 'M = "Hello, this is a secure message"',
    icon: FileText,
    color: "bg-blue-500",
    step: "Step 1",
  },
  {
    id: "step2",
    title: "Hash Function (H)",
    description: "Apply cryptographic hash function to create message digest",
    formula: "h = H(M)",
    example: 'h = SHA-256(M) = "a1b2c3d4..."',
    icon: Hash,
    color: "bg-green-500",
    step: "Step 2",
  },
  {
    id: "step3",
    title: "Bundle Message + Hash",
    description: "Combine original message with hash digest",
    formula: "Bundle = M + h",
    example: "Bundle = Message + Hash Digest",
    icon: Plus,
    color: "bg-purple-500",
    step: "Step 3",
  },
  {
    id: "step4",
    title: "Sign with Private Key",
    description: "Encrypt the bundle using sender's private key",
    formula: "Signature = E(Bundle, Private_Key)",
    example: "Digital Signature = RSASign(Bundle)",
    icon: Key,
    color: "bg-orange-500",
    step: "Step 4",
  },
  {
    id: "step5",
    title: "Send Signed Message",
    description: "Transmit the encrypted bundle to the receiver",
    formula: "Transmission = Encrypted_Bundle",
    example: "Sender → Receiver: Signed Message",
    icon: Lock,
    color: "bg-red-500",
    step: "Step 5",
  },
  {
    id: "step6",
    title: "Decrypt with Public Key",
    description: "Receiver decrypts using sender's public key",
    formula: "Decrypted = D(Signature, Public_Key)",
    example: "Bundle = RSAVerify(Signature, Public_Key)",
    icon: Unlock,
    color: "bg-indigo-500",
    step: "Step 6",
  },
  {
    id: "step7",
    title: "Extract Message & Hash",
    description: "Separate the original message and hash digest",
    formula: "M', h' = Extract(Decrypted)",
    example: 'Message\' = "Hello, this...", Hash\' = "a1b2c3d4..."',
    icon: Shield,
    color: "bg-emerald-500",
    step: "Step 7",
  },
  {
    id: "step8",
    title: "Re-compute Hash",
    description: "Apply same hash function to extracted message",
    formula: "h_new = H(M')",
    example: 'h_new = SHA-256(Message\') = "a1b2c3d4..."',
    icon: Hash,
    color: "bg-teal-500",
    step: "Step 8",
  },
  {
    id: "step9",
    title: "Compare Hashes",
    description: "Verify integrity by comparing hash values",
    formula: "Valid = (h' == h_new)",
    example: "If hashes match: ✓ Authentic & Unmodified",
    icon: CheckCircle,
    color: "bg-cyan-500",
    step: "Step 9",
  },
];

export function DSAWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < dsaSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < dsaSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            setIsComplete(true);
            return prev;
          }
        });
      }, 2500);
    } else if (currentStep >= dsaSteps.length - 1) {
      setIsPlaying(false);
      setIsComplete(true);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (isComplete) {
      setCurrentStep(0);
      setIsComplete(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setIsComplete(false);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
    setIsComplete(stepIndex >= dsaSteps.length - 1);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Digital Signature Process (DSA)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Interactive walkthrough of the complete digital signature workflow
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePlay}
              variant={isPlaying ? "secondary" : "default"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {isComplete ? "Replay" : "Play"}
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Step {currentStep + 1} of {dsaSteps.length}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {dsaSteps[currentStep].title}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round(((currentStep + 1) / dsaSteps.length) * 100)}% Complete
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / dsaSteps.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Step Navigation */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mb-6">
          {dsaSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isPassed = index < currentStep;
            const isFuture = index > currentStep;

            return (
              <Button
                key={step.id}
                onClick={() => handleStepClick(index)}
                variant={
                  isActive ? "default" : isPassed ? "secondary" : "outline"
                }
                className={`
                  relative p-2 h-auto flex flex-col items-center gap-1
                  ${isActive ? "ring-2 ring-primary" : ""}
                  ${isPassed ? "opacity-75" : ""}
                  ${isFuture ? "opacity-50" : ""}
                `}
                size="sm"
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-white text-xs
                    ${step.color}
                  `}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">{index + 1}</span>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 border-2 border-primary rounded-md"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Button>
            );
          })}
        </div>

        {/* Current Step Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="border rounded-lg p-6 bg-gradient-to-br from-background to-muted/30"
          >
            <div className="flex items-start gap-4">
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0
                  ${dsaSteps[currentStep].color}
                `}
              >
                {React.createElement(dsaSteps[currentStep].icon, {
                  className: "h-6 w-6",
                })}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {dsaSteps[currentStep].step}
                  </Badge>
                  <h3 className="text-lg font-semibold">
                    {dsaSteps[currentStep].title}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {dsaSteps[currentStep].description}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Formula:</h4>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {dsaSteps[currentStep].formula}
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Example:</h4>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {dsaSteps[currentStep].example}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Flow Visualization */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Process Flow
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {dsaSteps.slice(0, currentStep + 1).map((step, index) => (
              <React.Fragment key={step.id}>
                <span
                  className={`
                    px-2 py-1 rounded font-medium
                    ${
                      index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-background"
                    }
                  `}
                >
                  {step.title}
                </span>
                {index < currentStep && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
            {currentStep < dsaSteps.length - 1 && (
              <>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-50" />
                <span className="px-2 py-1 rounded text-muted-foreground opacity-50">
                  {dsaSteps[currentStep + 1].title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Completion Message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Digital Signature Process Complete!
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              The message has been successfully signed and verified, ensuring
              authentication, integrity, and non-repudiation.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
