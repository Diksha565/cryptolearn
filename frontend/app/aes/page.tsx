"use client";

import { useState } from "react";
import { ExplanationCard } from "@/components/explanation-card";
import { CryptoForm } from "@/components/crypto-form";
import { OutputDisplay } from "@/components/output-display";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { aesAPI } from "@/lib/api";

export default function AESPage() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, string | number>>({});

  const formFields = [
    {
      name: "operation",
      label: "Operation",
      type: "select" as const,
      options: [
        { value: "encrypt", label: "Encrypt" },
        { value: "decrypt", label: "Decrypt" },
      ],
      required: true,
    },
    {
      name: "text",
      label: "Text",
      type: "textarea" as const,
      placeholder: "Enter text to encrypt or paste ciphertext to decrypt...",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "text" as const,
      placeholder: "Enter a strong password...",
      required: true,
    },
  ];

  const handleSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    setError("");
    setResult("");
    setMetadata({});

    try {
      let response;

      if (data.operation === "encrypt") {
        response = await aesAPI.encrypt({
          plaintext: data.text,
          key: data.password,
          mode: "CBC",
          key_size: 256,
        });

        if (response.success) {
          setResult(response.ciphertext);
          setMetadata({
            Algorithm: "AES-256-CBC",
            Operation: "Encryption",
            "Input Length": `${data.text.length} characters`,
            "Output Format": "Base64",
          });
        } else {
          setError(response.error || "Encryption failed");
        }
      } else if (data.operation === "decrypt") {
        response = await aesAPI.decrypt({
          ciphertext: data.text,
          key: data.password,
          mode: "CBC",
          key_size: 256,
        });

        if (response.success) {
          setResult(response.plaintext);
          setMetadata({
            Algorithm: "AES-256-CBC",
            Operation: "Decryption",
            "Output Length": `${response.plaintext.length} characters`,
          });
        } else {
          setError(response.error || "Decryption failed");
        }
      }
    } catch (error: any) {
      setError(
        error.message || "An error occurred while processing your request"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">AES Encryption</h1>
            <p className="text-muted-foreground">
              Advanced Encryption Standard
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <ExplanationCard
          title="AES (Advanced Encryption Standard)"
          description="A symmetric encryption algorithm widely used across the globe for securing sensitive data."
          theory="AES is a symmetric block cipher that encrypts data in fixed-size blocks of 128 bits using keys of 128, 192, or 256 bits. It uses a series of transformations including SubBytes, ShiftRows, MixColumns, and AddRoundKey operations. The algorithm performs multiple rounds (10, 12, or 14 depending on key size) to ensure strong security. Each round applies these transformations to scramble the data, making it computationally infeasible to reverse without the correct key."
          useCases={[
            "Securing sensitive files and documents",
            "HTTPS/TLS web traffic encryption",
            "Database encryption at rest",
            "VPN tunnel encryption",
            "Wireless network security (WPA2/WPA3)",
            "Government and military communications",
          ]}
          pros={[
            "Extremely secure with no known practical attacks",
            "Fast encryption and decryption performance",
            "Standardized by NIST and widely adopted",
            "Hardware acceleration available on modern processors",
            "Multiple key sizes (128, 192, 256 bits) for different security needs",
          ]}
          cons={[
            "Requires secure key management and distribution",
            "Same key used for encryption and decryption",
            "Block cipher padding can reveal information about plaintext length",
            "Vulnerable to side-channel attacks if not properly implemented",
          ]}
          complexity="Moderate"
          keySize="128/192/256 bits"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <CryptoForm
            title="AES Encryption/Decryption"
            description="Enter text and password for secure AES-256 encryption"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <OutputDisplay
            title="AES Result"
            result={result}
            error={error}
            metadata={metadata}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
