"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, RotateCcw, ChevronRight } from "lucide-react";

interface RSAStep {
  title: string;
  description: string;
  formula?: string;
  calculation?: string;
  result?: string;
  highlight?: string[];
}

const RSA_EXAMPLE_STEPS: RSAStep[] = [
  {
    title: "Step 1: Choose Two Prime Numbers",
    description: "Select two distinct prime numbers p and q",
    formula: "p = 11, q = 13",
    calculation: "Both 11 and 13 are prime numbers",
    result: "p = 11, q = 13",
    highlight: ["p", "q"],
  },
  {
    title: "Step 2: Calculate Modulus (n)",
    description: "Multiply the two primes to get the modulus",
    formula: "n = p × q",
    calculation: "n = 11 × 13 = 143",
    result: "n = 143",
    highlight: ["n"],
  },
  {
    title: "Step 3: Calculate Euler's Totient φ(n)",
    description: "Calculate φ(n) = (p-1)(q-1)",
    formula: "φ(n) = (p-1) × (q-1)",
    calculation: "φ(143) = (11-1) × (13-1) = 10 × 12 = 120",
    result: "φ(n) = 120",
    highlight: ["φ(n)"],
  },
  {
    title: "Step 4: Choose Public Exponent (e)",
    description: "Choose e such that 1 < e < φ(n) and gcd(e, φ(n)) = 1",
    formula: "e = 7 (coprime with 120)",
    calculation: "gcd(7, 120) = 1 ✓",
    result: "e = 7",
    highlight: ["e"],
  },
  {
    title: "Step 5: Calculate Private Exponent (d)",
    description: "Find d such that (e × d) ≡ 1 (mod φ(n))",
    formula: "e × d ≡ 1 (mod φ(n))",
    calculation:
      "7 × d ≡ 1 (mod 120)\nd = 103 (since 7 × 103 = 721 ≡ 1 mod 120)",
    result: "d = 103",
    highlight: ["d"],
  },
  {
    title: "Keys Generated!",
    description: "RSA key pair is ready for encryption/decryption",
    formula: "Public Key: (n, e) = (143, 7)\nPrivate Key: (n, d) = (143, 103)",
    result: "Keys: Public(143, 7), Private(143, 103)",
    highlight: ["keys"],
  },
  {
    title: "Step 6: Encryption Example",
    description: "Encrypt message M = 42 using public key",
    formula: "C = M^e mod n",
    calculation: "C = 42^7 mod 143\nC = 230,539,333,248 mod 143\nC = 123",
    result: "Ciphertext = 123",
    highlight: ["encryption"],
  },
  {
    title: "Step 7: Decryption Example",
    description: "Decrypt ciphertext C = 123 using private key",
    formula: "M = C^d mod n",
    calculation: "M = 123^103 mod 143\n(Large calculation)\nM = 42",
    result: "Original Message = 42",
    highlight: ["decryption"],
  },
];

export function RSAAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExample, setShowExample] = useState(false);

  useEffect(() => {
    if (isPlaying && currentStep < RSA_EXAMPLE_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 3000); // 3 seconds per step

      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep >= RSA_EXAMPLE_STEPS.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (currentStep >= RSA_EXAMPLE_STEPS.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
    setShowExample(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setShowExample(true);
  };

  const handleNext = () => {
    if (currentStep < RSA_EXAMPLE_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setShowExample(true);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
    setShowExample(true);
  };

  if (!showExample) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            RSA Algorithm Visualization
          </CardTitle>
          <CardDescription>
            Watch an animated demonstration of the RSA algorithm with a real
            example
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Button onClick={handlePlay} className="w-full max-w-sm">
              <PlayCircle className="w-4 h-4 mr-2" />
              Start RSA Animation
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              See how RSA works with p=11, q=13, and message=42
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStepData = RSA_EXAMPLE_STEPS[currentStep];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            RSA Algorithm Animation
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? handlePause : handlePlay}
            >
              {isPlaying ? (
                <PauseCircle className="w-4 h-4" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentStep >= RSA_EXAMPLE_STEPS.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {RSA_EXAMPLE_STEPS.length}:{" "}
          {currentStepData.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / RSA_EXAMPLE_STEPS.length) * 100}%`,
            }}
          ></div>
        </div>

        {/* Step Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {RSA_EXAMPLE_STEPS.map((step, index) => (
            <Button
              key={index}
              variant={
                index === currentStep
                  ? "default"
                  : index < currentStep
                  ? "secondary"
                  : "outline"
              }
              size="sm"
              onClick={() => handleStepClick(index)}
              className={`text-xs ${
                index === currentStep ? "animate-pulse" : ""
              }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-semibold text-lg mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-700 mb-3">{currentStepData.description}</p>

            {currentStepData.formula && (
              <div className="bg-white p-3 rounded border">
                <div className="font-mono text-sm">
                  <div className="text-blue-600 font-semibold mb-1">
                    Formula:
                  </div>
                  <div className="whitespace-pre-line">
                    {currentStepData.formula}
                  </div>
                </div>
              </div>
            )}

            {currentStepData.calculation && (
              <div className="bg-gray-50 p-3 rounded border mt-2">
                <div className="font-mono text-sm">
                  <div className="text-green-600 font-semibold mb-1">
                    Calculation:
                  </div>
                  <div className="whitespace-pre-line">
                    {currentStepData.calculation}
                  </div>
                </div>
              </div>
            )}

            {currentStepData.result && (
              <div className="bg-green-50 p-3 rounded border mt-2">
                <div className="font-mono text-sm">
                  <div className="text-green-700 font-semibold mb-1">
                    Result:
                  </div>
                  <div className="font-bold text-green-800">
                    {currentStepData.result}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visual representation */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Visual Summary:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div
                className={`p-2 rounded ${
                  currentStepData.highlight?.includes("p")
                    ? "bg-yellow-200 animate-pulse"
                    : "bg-white"
                } border`}
              >
                <div className="font-semibold">p</div>
                <div>11</div>
              </div>
              <div
                className={`p-2 rounded ${
                  currentStepData.highlight?.includes("q")
                    ? "bg-yellow-200 animate-pulse"
                    : "bg-white"
                } border`}
              >
                <div className="font-semibold">q</div>
                <div>13</div>
              </div>
              <div
                className={`p-2 rounded ${
                  currentStepData.highlight?.includes("n")
                    ? "bg-yellow-200 animate-pulse"
                    : "bg-white"
                } border`}
              >
                <div className="font-semibold">n</div>
                <div>{currentStep >= 1 ? "143" : "?"}</div>
              </div>
              <div
                className={`p-2 rounded ${
                  currentStepData.highlight?.includes("φ(n)")
                    ? "bg-yellow-200 animate-pulse"
                    : "bg-white"
                } border`}
              >
                <div className="font-semibold">φ(n)</div>
                <div>{currentStep >= 2 ? "120" : "?"}</div>
              </div>
              <div
                className={`p-2 rounded ${
                  currentStepData.highlight?.includes("e")
                    ? "bg-yellow-200 animate-pulse"
                    : "bg-white"
                } border`}
              >
                <div className="font-semibold">e</div>
                <div>{currentStep >= 3 ? "7" : "?"}</div>
              </div>
              <div
                className={`p-2 rounded ${
                  currentStepData.highlight?.includes("d")
                    ? "bg-yellow-200 animate-pulse"
                    : "bg-white"
                } border`}
              >
                <div className="font-semibold">d</div>
                <div>{currentStep >= 4 ? "103" : "?"}</div>
              </div>
              <div
                className={`p-2 rounded ${
                  currentStepData.highlight?.includes("encryption")
                    ? "bg-green-200 animate-pulse"
                    : "bg-white"
                } border`}
              >
                <div className="font-semibold">M → C</div>
                <div>{currentStep >= 6 ? "42 → 123" : "? → ?"}</div>
              </div>
              <div
                className={`p-2 rounded ${
                  currentStepData.highlight?.includes("decryption")
                    ? "bg-blue-200 animate-pulse"
                    : "bg-white"
                } border`}
              >
                <div className="font-semibold">C → M</div>
                <div>{currentStep >= 7 ? "123 → 42" : "? → ?"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Instructions */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          {isPlaying
            ? "Animation is playing automatically..."
            : "Use controls above to navigate or play the animation"}
        </div>
      </CardContent>
    </Card>
  );
}
