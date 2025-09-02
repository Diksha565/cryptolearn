"use client";

import { useState } from "react";
import { ExplanationCard } from "@/components/explanation-card";
import { FileUploadForm } from "@/components/file-upload-form";
import { OutputDisplay } from "@/components/output-display";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { steganographyAPI } from "@/lib/api";

export default function SteganographyPage() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, string | number>>({});
  const [resultImage, setResultImage] = useState<string>("");

  const formFields = [
    {
      name: "image",
      label: "Cover Image",
      type: "file" as const,
      accept: ".jpg,.jpeg,.png,.bmp,.tiff",
      required: true,
    },
    {
      name: "operation",
      label: "Operation",
      type: "select" as const,
      options: [
        { value: "embed", label: "Embed Secret Message" },
        { value: "extract", label: "Extract Hidden Message" },
      ],
      required: true,
    },
    {
      name: "secretMessage",
      label: "Secret Message",
      type: "textarea" as const,
      placeholder:
        "Enter the secret message to hide (required for embedding)...",
      required: false,
    },
  ];

  const handleFileSelect = (file: File) => {
    setResult("");
    setError("");
    setResultImage("");
  };

  const handleFormSubmit = async (
    data: Record<string, string | File | File[]>
  ) => {
    const file = data.image as File;
    if (!file) {
      setError("Please select an image file first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult("");
    setResultImage("");

    try {
      if (data.operation === "embed") {
        if (!data.secretMessage) {
          throw new Error("Secret message is required for embedding operation");
        }
        // Use standard LSB method for simplicity
        const response = await steganographyAPI.embed(
          file!,
          data.secretMessage as string
        );
        setResult(`Message embedded successfully!`);
        setResultImage(response.image_base64);
        setMetadata(response.metadata || {});
      } else if (data.operation === "extract") {
        const response = await steganographyAPI.extract(file!);
        setResult(`Extracted message: ${response.message}`);
        setMetadata(response.metadata || {});
      }
    } catch (err) {
      console.error("Steganography operation failed:", err);
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
            <h1 className="text-2xl font-bold">Steganography</h1>
            <p className="text-muted-foreground">
              The Art of Hidden Communication
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <ExplanationCard
          title="Steganography"
          description="The practice of concealing information within other non-secret data or physical media to hide the existence of the information."
          theory="Steganography works by exploiting the redundancy in digital media to hide information without significantly altering the appearance of the cover medium. In digital images, common techniques include LSB (Least Significant Bit) substitution, where the least significant bits of pixel values are replaced with message bits, DCT (Discrete Cosine Transform) domain embedding in JPEG images, and DWT (Discrete Wavelet Transform) methods. The goal is to maintain statistical properties of the cover image while embedding the secret message. Advanced techniques use error correction codes, encryption, and spread spectrum methods to improve robustness and security against detection and extraction attacks."
          useCases={[
            "Covert communication and secure messaging",
            "Digital watermarking for copyright protection",
            "Data exfiltration and information hiding",
            "Secure storage of sensitive information",
            "Military and intelligence communications",
            "Bypassing censorship and surveillance",
            "Forensic investigations and evidence hiding",
            "Privacy protection in digital communications",
          ]}
          pros={[
            "Completely hidden communication - no evidence of secret message",
            "Can bypass detection by automated monitoring systems",
            "Works with various media types (images, audio, video, text)",
            "Can be combined with encryption for additional security",
            "Difficult to detect without specialized steganalysis tools",
            "Large capacity in high-resolution images",
            "No special software required for viewing cover media",
          ]}
          cons={[
            "Vulnerable to steganalysis and statistical detection",
            "Cover media modification may destroy hidden message",
            "Limited payload capacity compared to direct encryption",
            "Quality degradation of cover media with large payloads",
            "Requires original cover media for some extraction methods",
            "Compression can destroy embedded information",
            "Legal implications in some jurisdictions",
          ]}
          complexity="Advanced"
          keySize="Variable payload"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FileUploadForm
              title="Steganography Operations"
              description="Upload an image and configure steganography settings"
              fields={formFields}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
          </div>

          <OutputDisplay
            title="Steganography Result"
            result={result}
            error={error}
            metadata={metadata}
            isLoading={isLoading}
            imageResult={resultImage}
          />
        </div>
      </div>
    </div>
  );
}
