"use client";

import { useState } from "react";
import { ExplanationCard } from "@/components/explanation-card";
import { CryptoForm } from "@/components/crypto-form";
import { OutputDisplay } from "@/components/output-display";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { signatureAPI } from "@/lib/api";

export default function DigitalSignaturePage() {
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
        { value: "sign", label: "Sign Document" },
        { value: "verify", label: "Verify Signature" },
      ],
      required: true,
    },
    {
      name: "document",
      label: "Document/Message",
      type: "textarea" as const,
      placeholder: "Enter the document or message to sign/verify...",
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
        // Use standard RSA with 2048 bits for simplicity
        const response = await signatureAPI.generateKeypair({
          algorithm: "rsa",
          key_size: 2048,
        });
        setResult(
          `Key pair generated successfully!\n\nPublic Key:\n${response.public_key}\n\nPrivate Key:\n${response.private_key}`
        );
        setMetadata(response.metadata || {});
      } else if (data.operation === "sign") {
        if (!data.document || !data.privateKey) {
          throw new Error("Document and private key are required for signing");
        }
        const response = await signatureAPI.sign({
          message: data.document,
          private_key: data.privateKey,
          algorithm: "rsa",
        });
        setResult(
          `Document signed successfully!\n\nSignature:\n${response.signature}`
        );
        setMetadata(response.metadata || {});
      } else if (data.operation === "verify") {
        if (!data.document || !data.signature || !data.publicKey) {
          throw new Error(
            "Document, signature, and public key are required for verification"
          );
        }
        const response = await signatureAPI.verify({
          message: data.document,
          signature: data.signature,
          public_key: data.publicKey,
          algorithm: "rsa",
        });
        setResult(
          `Signature verification: ${response.valid ? "VALID" : "INVALID"}`
        );
        setMetadata(response.metadata || {});
      }
    } catch (err) {
      console.error("Digital signature operation failed:", err);
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
            <h1 className="text-2xl font-bold">Digital Signature</h1>
            <p className="text-muted-foreground">
              Cryptographic Authentication and Non-Repudiation
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <ExplanationCard
          title="Digital Signature"
          description="A cryptographic mechanism that provides authentication, integrity, and non-repudiation for digital documents."
          theory="Digital signatures use public-key cryptography to create a unique digital fingerprint for documents. The process involves creating a hash of the document using a cryptographic hash function (like SHA-256), then encrypting this hash with the signer's private key. The resulting signature can be verified by anyone using the signer's public key to decrypt the signature and compare it with a fresh hash of the document. If they match, the signature is valid, proving the document hasn't been altered and was signed by the holder of the private key. This provides mathematical proof of authenticity and integrity."
          useCases={[
            "Legal document authentication and contracts",
            "Software code signing and distribution",
            "Email security (S/MIME, PGP)",
            "Financial transactions and banking",
            "Government and regulatory compliance",
            "Medical records and healthcare data",
            "Blockchain and cryptocurrency transactions",
            "Digital certificates and PKI systems",
          ]}
          pros={[
            "Provides strong authentication of document origin",
            "Ensures document integrity and detects tampering",
            "Non-repudiation prevents denial of signing",
            "Legally recognized in most jurisdictions",
            "Can be verified by anyone with the public key",
            "Timestamping provides proof of signing time",
            "Scales well for large-scale deployments",
          ]}
          cons={[
            "Requires proper key management and PKI infrastructure",
            "Private key compromise invalidates all signatures",
            "Certificate expiration and revocation complexity",
            "Computational overhead for signing and verification",
            "Legal framework varies by jurisdiction",
            "User education required for proper implementation",
            "Vulnerable to quantum computing attacks",
          ]}
          complexity="Intermediate"
          keySize="2048-4096 bits"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <CryptoForm
            title="Digital Signature Operations"
            description="Generate key pairs, create digital signatures, or verify document authenticity"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          <OutputDisplay
            title="Digital Signature Result"
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
