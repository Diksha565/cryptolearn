"use client";

import { useState } from "react";
import { ExplanationCard } from "@/components/explanation-card";
import { CryptoForm } from "@/components/crypto-form";
import { OutputDisplay } from "@/components/output-display";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { eccAPI } from "@/lib/api";

export default function ECCPage() {
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
        { value: "generate", label: "Generate Key Pair" },
        { value: "sign", label: "Sign Message" },
        { value: "verify", label: "Verify Signature" },
      ],
      required: true,
    },
    {
      name: "message",
      label: "Message",
      type: "textarea" as const,
      placeholder: "Enter the message to sign or verify...",
      required: false,
    },
    {
      name: "privateKey",
      label: "Private Key (for signing)",
      type: "textarea" as const,
      placeholder: "Enter the private key in PEM format...",
      required: false,
    },
    {
      name: "publicKey",
      label: "Public Key (for verification)",
      type: "textarea" as const,
      placeholder: "Enter the public key in PEM format...",
      required: false,
    },
    {
      name: "signature",
      label: "Signature (for verification)",
      type: "text" as const,
      placeholder: "Enter the signature to verify...",
      required: false,
    },
  ];

  const handleSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      if (data.operation === "generate") {
        // Use standard P-256 curve for simplicity
        const response = await eccAPI.generateKeypair("secp256r1");
        setResult(
          `Key pair generated successfully!\n\nPublic Key:\n${response.public_key}\n\nPrivate Key:\n${response.private_key}`
        );
        setMetadata(response.metadata || {});
      } else if (data.operation === "sign") {
        if (!data.message || !data.privateKey) {
          throw new Error("Message and private key are required for signing");
        }
        const response = await eccAPI.sign({
          message: data.message,
          private_key: data.privateKey,
        });
        setResult(
          `Message signed successfully!\n\nSignature:\n${response.signature}`
        );
        setMetadata(response.metadata || {});
      } else if (data.operation === "verify") {
        if (!data.message || !data.signature || !data.publicKey) {
          throw new Error(
            "Message, signature, and public key are required for verification"
          );
        }
        const response = await eccAPI.verify({
          message: data.message,
          signature: data.signature,
          public_key: data.publicKey,
        });
        setResult(
          `Signature verification: ${response.valid ? "VALID" : "INVALID"}`
        );
        setMetadata(response.metadata || {});
      }
    } catch (err) {
      console.error("ECC operation failed:", err);
      setError(err instanceof Error ? err.message : "Operation failed");
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
            <h1 className="text-2xl font-bold">ECC Cryptography</h1>
            <p className="text-muted-foreground">Elliptic Curve Cryptography</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <ExplanationCard
          title="ECC (Elliptic Curve Cryptography)"
          description="A modern public-key cryptography approach based on the algebraic structure of elliptic curves over finite fields."
          theory="ECC is based on the mathematical properties of elliptic curves defined by the equation y² = x³ + ax + b. The security relies on the Elliptic Curve Discrete Logarithm Problem (ECDLP), which is computationally harder to solve than the integer factorization problem used in RSA. This allows ECC to provide the same level of security as RSA with much smaller key sizes. For example, a 256-bit ECC key provides equivalent security to a 3072-bit RSA key. ECC operations involve point addition and scalar multiplication on the curve, making it highly efficient for both encryption and digital signatures."
          useCases={[
            "Mobile and IoT device security (low power consumption)",
            "Cryptocurrency and blockchain technology (Bitcoin, Ethereum)",
            "TLS/SSL certificates for web security",
            "Smart card and embedded system cryptography",
            "Digital signatures for software and document authentication",
            "Key exchange protocols (ECDH)",
          ]}
          pros={[
            "Smaller key sizes compared to RSA for equivalent security",
            "Faster computation and lower power consumption",
            "Excellent for resource-constrained environments",
            "Strong mathematical foundation with no known efficient attacks",
            "Supports both encryption and digital signature operations",
            "Better performance in mobile and embedded applications",
          ]}
          cons={[
            "More complex mathematical implementation than RSA",
            "Potential vulnerability to quantum computing (Shor's algorithm)",
            "Requires careful implementation to avoid side-channel attacks",
            "Less mature than RSA in terms of widespread adoption",
            "Curve parameter selection is critical for security",
            "Patent issues with some curve implementations",
          ]}
          complexity="Advanced"
          keySize="256-521 bits"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <CryptoForm
            title="ECC Operations"
            description="Perform elliptic curve cryptography operations including key generation, encryption, and digital signatures"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <OutputDisplay
            title="ECC Result"
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
