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
  Key,
  Hash,
  Calculator,
  Lock,
  Unlock,
  Shield,
  Zap,
  Pause,
} from "lucide-react";

interface RSAStep {
  id: string;
  title: string;
  description: string;
  formula: string;
  example: string;
  icon: React.ComponentType<any>;
  color: string;
}

const rsaSteps: RSAStep[] = [
  {
    id: "step1",
    title: "Choose Primes",
    description: "Select two distinct prime numbers p and q",
    formula: "p, q ∈ Primes",
    example: "p = 11, q = 13",
    icon: Hash,
    color: "bg-blue-500",
  },
  {
    id: "step2",
    title: "Calculate n",
    description: "Compute the modulus by multiplying the primes",
    formula: "n = p × q",
    example: "n = 11 × 13 = 143",
    icon: Calculator,
    color: "bg-green-500",
  },
  {
    id: "step3",
    title: "Calculate φ(n)",
    description: "Compute Euler's totient function",
    formula: "φ(n) = (p-1)(q-1)",
    example: "φ(143) = 10 × 12 = 120",
    icon: Zap,
    color: "bg-purple-500",
  },
  {
    id: "step4",
    title: "Choose e",
    description: "Select public exponent coprime with φ(n)",
    formula: "gcd(e, φ(n)) = 1",
    example: "e = 7 (gcd(7, 120) = 1)",
    icon: Key,
    color: "bg-orange-500",
  },
  {
    id: "step5",
    title: "Calculate d",
    description: "Compute private exponent using modular inverse",
    formula: "e × d ≡ 1 (mod φ(n))",
    example: "7 × 103 ≡ 1 (mod 120), so d = 103",
    icon: Shield,
    color: "bg-red-500",
  },
  {
    id: "step6",
    title: "Encrypt",
    description: "Encrypt message using public key (n, e)",
    formula: "C = M^e mod n",
    example: "C = 42^7 mod 143 = 123",
    icon: Lock,
    color: "bg-indigo-500",
  },
  {
    id: "step7",
    title: "Decrypt",
    description: "Decrypt ciphertext using private key (n, d)",
    formula: "M = C^d mod n",
    example: "M = 123^103 mod 143 = 42",
    icon: Unlock,
    color: "bg-emerald-500",
  },
];

export function RSAWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlay && isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= rsaSteps.length - 1) {
            setIsAutoPlay(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000); // 3 seconds per step
    }

    return () => clearInterval(interval);
  }, [isAutoPlay, isPlaying, currentStep]);

  const nextStep = () => {
    if (currentStep < rsaSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const startAnimation = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setIsAutoPlay(true);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setIsAutoPlay(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>RSA Algorithm Walkthrough</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Step-by-step visualization of the RSA cryptographic process
          </p>
        </div>
        <div className="flex gap-2">
          {isPlaying ? (
            <Button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              variant="outline"
              size="sm"
            >
              {isAutoPlay ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isAutoPlay ? "Pause" : "Resume"}
            </Button>
          ) : (
            <Button onClick={startAnimation} variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}
          <Button onClick={resetAnimation} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isPlaying && (
          <div className="space-y-6">
            {/* Progress Steps */}
            <motion.div
              className="flex items-center justify-between mb-8 overflow-x-auto pb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {rsaSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center min-w-0 flex-1 relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                      index <= currentStep ? step.color : "bg-gray-300"
                    }`}
                    animate={{
                      scale: index === currentStep ? 1.2 : 1,
                      opacity: index <= currentStep ? 1 : 0.5,
                      rotate: index === currentStep ? [0, 5, -5, 0] : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      rotate: {
                        duration: 0.6,
                        repeat: index === currentStep ? Infinity : 0,
                      },
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      animate={{ rotate: index === currentStep ? 360 : 0 }}
                      transition={{
                        duration: 2,
                        repeat: index === currentStep ? Infinity : 0,
                        ease: "linear",
                      }}
                    >
                      <step.icon className="h-6 w-6" />
                    </motion.div>
                  </motion.div>
                  <motion.span
                    className="text-xs mt-2 text-center max-w-16 truncate font-medium"
                    animate={{
                      color: index <= currentStep ? "#1f2937" : "#9ca3af",
                      fontWeight: index === currentStep ? 600 : 400,
                    }}
                  >
                    {step.title}
                  </motion.span>
                  {index < rsaSteps.length - 1 && (
                    <motion.div
                      className="absolute top-6 left-12 w-8 h-0.5"
                      initial={{ scaleX: 0, backgroundColor: "#d1d5db" }}
                      animate={{
                        scaleX: 1,
                        backgroundColor:
                          index < currentStep ? "#10b981" : "#d1d5db",
                      }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      style={{ originX: 0 }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Current Step Details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -30, rotateX: 15 }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut",
                  opacity: { duration: 0.4 },
                }}
                className="text-center p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-lg border shadow-lg"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Badge
                    className={`mb-4 ${rsaSteps[currentStep].color} text-white`}
                  >
                    Step {currentStep + 1} of {rsaSteps.length}
                  </Badge>
                </motion.div>

                <motion.h3
                  className="text-2xl font-bold mb-3 flex items-center justify-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ delay: 0.5, duration: 0.8, repeat: 1 }}
                  >
                    {React.createElement(rsaSteps[currentStep].icon, {
                      className: "h-6 w-6",
                    })}
                  </motion.div>
                  {rsaSteps[currentStep].title}
                </motion.h3>

                <motion.p
                  className="text-muted-foreground mb-4 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {rsaSteps[currentStep].description}
                </motion.p>

                {/* Formula Display */}
                <motion.div
                  className="bg-white dark:bg-slate-800 p-4 rounded-lg border mb-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-sm text-muted-foreground mb-2">Formula:</p>
                  <motion.p
                    className="font-mono text-lg font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                  >
                    {rsaSteps[currentStep].formula}
                  </motion.p>
                </motion.div>

                {/* Example Display */}
                <motion.div
                  className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                    Example:
                  </p>
                  <motion.p
                    className="font-mono text-lg font-semibold text-yellow-800 dark:text-yellow-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                  >
                    {rsaSteps[currentStep].example}
                  </motion.p>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Visual Animation */}
            <motion.div
              className="flex items-center justify-center space-x-2 py-8 overflow-x-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {rsaSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="flex items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                >
                  <motion.div
                    className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 ${
                      index <= currentStep
                        ? `${step.color} border-transparent`
                        : "bg-gray-100 border-gray-300"
                    }`}
                    animate={{
                      scale: index === currentStep ? 1.1 : 1,
                      opacity: index <= currentStep ? 1 : 0.3,
                      rotateY: index === currentStep ? [0, 15, -15, 0] : 0,
                      boxShadow:
                        index === currentStep
                          ? "0 10px 25px rgba(59, 130, 246, 0.3)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    transition={{
                      duration: 0.3,
                      rotateY: {
                        duration: 1.5,
                        repeat: index === currentStep ? Infinity : 0,
                        ease: "easeInOut",
                      },
                      boxShadow: { duration: 0.3 },
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      animate={{
                        rotate: index === currentStep ? 360 : 0,
                        scale: index === currentStep ? [1, 1.1, 1] : 1,
                      }}
                      transition={{
                        rotate: {
                          duration: 2,
                          repeat: index === currentStep ? Infinity : 0,
                          ease: "linear",
                        },
                        scale: {
                          duration: 1,
                          repeat: index === currentStep ? Infinity : 0,
                        },
                      }}
                    >
                      <step.icon
                        className={`h-8 w-8 ${
                          index <= currentStep ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </motion.div>
                  </motion.div>
                  {index < rsaSteps.length - 1 && (
                    <motion.div
                      className="w-4 h-1 mx-2 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: 1,
                        backgroundColor:
                          index < currentStep ? "#10b981" : "#d1d5db",
                      }}
                      transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                      style={{ originX: 0 }}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Navigation */}
            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={nextStep}
                  className={`${rsaSteps[currentStep].color} hover:opacity-90 transition-all duration-300`}
                  size="lg"
                >
                  {currentStep < rsaSteps.length - 1 ? (
                    <>
                      Next Step
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restart
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                animate={{
                  width: `${((currentStep + 1) / rsaSteps.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Progress: {currentStep + 1} of {rsaSteps.length} steps completed
            </div>
          </div>
        )}

        {!isPlaying && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Ready to Learn RSA?
              </h3>
              <p className="text-muted-foreground">
                Click "Start" to begin the interactive walkthrough of the RSA
                algorithm. You'll see each step with formulas and real examples.
              </p>
            </div>
            <Button
              onClick={startAnimation}
              size="lg"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Play className="h-5 w-5 mr-2" />
              Start RSA Walkthrough
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
