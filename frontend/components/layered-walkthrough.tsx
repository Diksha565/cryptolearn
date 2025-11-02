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
  Lock,
  Shield,
  Pause,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface LayeredStep {
  id: string;
  title: string;
  description: string;
  input: string;
  output: string;
  icon: React.ComponentType<any>;
  color: string;
  algorithm: string;
  details: string;
}

const layeredSteps: LayeredStep[] = [
  {
    id: "step0",
    title: "Plaintext",
    description: "Your original message that needs to be encrypted",
    input: "",
    output: "Hello, this is my secret message!",
    icon: FileText,
    color: "bg-gray-500",
    algorithm: "Original Data",
    details: "This is your sensitive data that will be protected through 5 security layers",
  },
  {
    id: "step1",
    title: "AES Encryption",
    description: "Layer 1: Encrypt with AES-256-CBC symmetric encryption",
    input: "Hello, this is my secret message!",
    output: "h0AI3VeFMt+ur6wNr+a2... (AES encrypted)",
    icon: Lock,
    color: "bg-blue-500",
    algorithm: "AES-256-CBC",
    details: "AES-256 in CBC mode provides strong symmetric encryption with a random IV (Initialization Vector) for confidentiality.",
  },
  {
    id: "step2",
    title: "Key Encryption",
    description: "Layer 2: Encrypt AES key with RSA-2048 or ECC",
    input: "AES Key: 7ae8898458befa8240...",
    output: "Da69ocqcdI0MPzQ5ofl7... (Encrypted key)",
    icon: Key,
    color: "bg-green-500",
    algorithm: "RSA-2048 / ECC",
    details: "The AES key is encrypted using RSA-2048 or ECC for secure key distribution. Recipient uses their private key to decrypt.",
  },
  {
    id: "step3",
    title: "Watermarking",
    description: "Layer 3: Embed sender identifier using zero-width characters",
    input: "h0AI3VeFMt+ur6wNr+a2... (AES ciphertext)",
    output: "h0AI3VeFMt+ur6wNr+a2...​‌​‌​ (Watermarked)",
    icon: Shield,
    color: "bg-yellow-500",
    algorithm: "Zero-Width Unicode",
    details: "Sender ID is embedded using invisible zero-width Unicode characters (\\u200B and \\u200C) to prove message origin.",
  },
  {
    id: "step4",
    title: "Digital Signature",
    description: "Layer 4: Sign hash with RSA/ECDSA for integrity",
    input: "Watermarked ciphertext hash",
    output: "dlXpBz2F8K3yp4FqcM41... (Signature)",
    icon: CheckCircle2,
    color: "bg-purple-500",
    algorithm: "SHA-256 + RSA/ECDSA",
    details: "SHA-256 hashes the watermarked ciphertext, then it's signed with the sender's private key for authentication and integrity.",
  },
  {
    id: "step5",
    title: "Steganography",
    description: "Layer 5: Hide encrypted data in innocent-looking text",
    input: "Watermarked + Signed ciphertext",
    output: "The natural world offers countless examples...",
    icon: FileText,
    color: "bg-pink-500",
    algorithm: "Whitespace Stego",
    details: "Encrypted data is hidden using whitespace steganography in cover text. Final output looks like normal text but contains hidden encrypted message.",
  },
  {
    id: "step6",
    title: "Decryption",
    description: "Reverse order: Extract → Verify → Decrypt",
    input: "The natural world offers countless examples...",
    output: "Hello, this is my secret message!",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    algorithm: "5-Layer Reverse",
    details: "Decryption reverses all layers: Extract from stego → Verify watermark → Verify signature → Decrypt key → Decrypt AES → Original message.",
  },
];

export function LayeredWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlay && isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= layeredSteps.length - 1) {
            setIsAutoPlay(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4000); // 4 seconds per step
    }

    return () => clearInterval(interval);
  }, [isAutoPlay, isPlaying, currentStep]);

  const nextStep = () => {
    if (currentStep < layeredSteps.length - 1) {
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
          <CardTitle>Advanced 5-Layer Encryption Walkthrough</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive visualization: AES → Key Encryption → Watermarking → Signature → Steganography
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
              {layeredSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="flex flex-col items-center min-w-0 flex-1 relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <motion.div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${
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
                      animate={{ 
                        rotate: index === currentStep ? 360 : 0,
                        y: index === currentStep ? [0, -5, 0] : 0,
                      }}
                      transition={{
                        rotate: {
                          duration: 2,
                          repeat: index === currentStep ? Infinity : 0,
                          ease: "linear",
                        },
                        y: {
                          duration: 1,
                          repeat: index === currentStep ? Infinity : 0,
                        }
                      }}
                    >
                      <step.icon className="h-7 w-7" />
                    </motion.div>
                  </motion.div>
                  <motion.span
                    className="text-xs mt-2 text-center max-w-20 font-medium"
                    animate={{
                      color: index <= currentStep ? "#1f2937" : "#9ca3af",
                      fontWeight: index === currentStep ? 600 : 400,
                    }}
                  >
                    {step.title}
                  </motion.span>
                  {index < layeredSteps.length - 1 && (
                    <motion.div
                      className="absolute top-7 left-14 w-12 h-0.5"
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
                initial={{ opacity: 0, y: 40, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -40, rotateX: 15 }}
                transition={{
                  duration: 0.7,
                  ease: "easeInOut",
                  opacity: { duration: 0.5 },
                }}
                className="text-center p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-lg border-2 shadow-xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Badge
                    className={`mb-4 ${layeredSteps[currentStep].color} text-white text-sm px-4 py-1`}
                  >
                    {layeredSteps[currentStep].algorithm}
                  </Badge>
                </motion.div>

                <motion.h3
                  className="text-3xl font-bold mb-3 flex items-center justify-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      delay: 0.5, 
                      duration: 1, 
                      repeat: 2 
                    }}
                  >
                    {React.createElement(layeredSteps[currentStep].icon, {
                      className: "h-8 w-8",
                    })}
                  </motion.div>
                  {layeredSteps[currentStep].title}
                </motion.h3>

                <motion.p
                  className="text-muted-foreground mb-6 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {layeredSteps[currentStep].description}
                </motion.p>

                {/* Input/Output Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Input */}
                  {layeredSteps[currentStep].input && (
                    <motion.div
                      className="bg-white dark:bg-slate-800 p-4 rounded-lg border-2"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                    >
                      <p className="text-xs text-muted-foreground mb-2 font-semibold">Input:</p>
                      <motion.p
                        className="font-mono text-sm break-all"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.3 }}
                      >
                        {layeredSteps[currentStep].input.substring(0, 50)}
                        {layeredSteps[currentStep].input.length > 50 ? "..." : ""}
                      </motion.p>
                    </motion.div>
                  )}

                  {/* Arrow */}
                  <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-8 w-8 text-primary" />
                    </motion.div>
                  </motion.div>

                  {/* Output */}
                  <motion.div
                    className={`p-4 rounded-lg border-2 ${layeredSteps[currentStep].color} bg-white dark:bg-slate-800`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
                  >
                    <p className="text-xs text-white mb-2 font-semibold">Output:</p>
                    <motion.p
                      className="font-mono text-sm text-white break-all"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      {layeredSteps[currentStep].output.substring(0, 50)}
                      {layeredSteps[currentStep].output.length > 50 ? "..." : ""}
                    </motion.p>
                  </motion.div>
                </div>

                {/* Details */}
                <motion.div
                  className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <motion.p
                      className="text-sm text-blue-700 dark:text-blue-300 text-left"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.3 }}
                    >
                      {layeredSteps[currentStep].details}
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Visual Animation Blocks */}
            <motion.div
              className="flex items-center justify-center space-x-3 py-8 overflow-x-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {layeredSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="flex items-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
                >
                  <motion.div
                    className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 ${
                      index <= currentStep
                        ? `${step.color} border-transparent`
                        : "bg-gray-100 border-gray-300"
                    }`}
                    animate={{
                      scale: index === currentStep ? 1.15 : 1,
                      opacity: index <= currentStep ? 1 : 0.3,
                      rotateY: index === currentStep ? [0, 20, -20, 0] : 0,
                      boxShadow:
                        index === currentStep
                          ? "0 15px 35px rgba(59, 130, 246, 0.4)"
                          : "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                    transition={{
                      duration: 0.4,
                      rotateY: {
                        duration: 2,
                        repeat: index === currentStep ? Infinity : 0,
                        ease: "easeInOut",
                      },
                      boxShadow: { duration: 0.3 },
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      animate={{
                        rotate: index === currentStep ? 360 : 0,
                        scale: index === currentStep ? [1, 1.15, 1] : 1,
                      }}
                      transition={{
                        rotate: {
                          duration: 3,
                          repeat: index === currentStep ? Infinity : 0,
                          ease: "linear",
                        },
                        scale: {
                          duration: 1.5,
                          repeat: index === currentStep ? Infinity : 0,
                        },
                      }}
                    >
                      <step.icon
                        className={`h-10 w-10 ${
                          index <= currentStep ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </motion.div>
                  </motion.div>
                  {index < layeredSteps.length - 1 && (
                    <motion.div
                      className="w-6 h-1 mx-2 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: 1,
                        backgroundColor:
                          index < currentStep ? "#10b981" : "#d1d5db",
                      }}
                      transition={{ duration: 0.6, delay: 1.3 + index * 0.1 }}
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
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={nextStep}
                  className={`${layeredSteps[currentStep].color} hover:opacity-90 transition-all duration-300`}
                  size="lg"
                >
                  {currentStep < layeredSteps.length - 1 ? (
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
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-3 rounded-full"
                animate={{
                  width: `${((currentStep + 1) / layeredSteps.length) * 100}%`,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>

            <div className="text-center text-sm text-muted-foreground font-medium">
              Progress: {currentStep + 1} of {layeredSteps.length} steps completed
            </div>
          </div>
        )}

        {!isPlaying && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="h-20 w-20 mx-auto text-primary mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-3">
              Ready to Explore 5-Layer Encryption?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Click "Start" to begin an interactive journey through the advanced 5-layer encryption system.
              Watch how your data is protected through AES, Key Encryption, Watermarking, Digital Signature, and Steganography.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={startAnimation}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Start 5-Layer Encryption Walkthrough
              </Button>
            </motion.div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
