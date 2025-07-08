"use client";

import { useState } from "react";
import { ExplanationCard } from "@/components/explanation-card";
import { FileUploadForm } from "@/components/file-upload-form";
import { OutputDisplay } from "@/components/output-display";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { watermarkAPI } from "@/lib/api";

export default function WatermarkingPage() {
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
        { value: "embed", label: "Embed Watermark" },
        { value: "extract", label: "Extract Watermark" },
      ],
      required: true,
    },
    {
      name: "watermarkText",
      label: "Watermark Text",
      type: "text" as const,
      placeholder:
        "Enter text to embed as watermark (required for embedding)...",
      required: false,
    },
  ];

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
        if (!data.watermarkText) {
          throw new Error("Watermark text is required for embedding operation");
        }
        // Use standard settings for simplicity
        const response = await watermarkAPI.addTextWatermark(file, {
          text: data.watermarkText as string,
          position: "bottom-right",
          opacity: 0.5, // Medium opacity
          font_size: 12,
        });
        setResult(`Watermark embedded successfully!`);
        setResultImage(response.image_base64);
        setMetadata(response.metadata || {});
      } else if (data.operation === "extract") {
        const response = await watermarkAPI.extractInvisibleWatermark(file, {});
        setResult(`Extracted watermark: ${response.watermark}`);
        setMetadata(response.metadata || {});
      }
    } catch (err) {
      console.error("Watermarking operation failed:", err);
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
            <h1 className="text-2xl font-bold">Digital Watermarking</h1>
            <p className="text-muted-foreground">
              Invisible Copyright Protection for Digital Media
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <ExplanationCard
          title="Digital Watermarking"
          description="A technique for embedding invisible information into digital media for copyright protection and authentication."
          theory="Digital watermarking embeds imperceptible information (watermark) into digital content like images, audio, or video. The process involves modifying the least significant bits (LSB), frequency domain coefficients (DCT/DWT), or spatial domain pixels to hide data. The watermark should be robust against common attacks like compression, filtering, and geometric transformations while remaining invisible to human perception. Advanced techniques use spread spectrum, quantization index modulation (QIM), or transform domain methods to achieve better trade-offs between imperceptibility, robustness, and capacity."
          useCases={[
            "Copyright protection for digital images and artwork",
            "Authentication of medical images and documents",
            "Broadcast monitoring and content tracking",
            "Digital rights management (DRM) systems",
            "Proof of ownership for intellectual property",
            "Tamper detection in sensitive documents",
          ]}
          pros={[
            "Invisible to human perception when properly implemented",
            "Provides copyright protection and ownership proof",
            "Can survive common image processing operations",
            "Enables content authentication and integrity verification",
            "Supports both visible and invisible watermarking",
          ]}
          cons={[
            "May degrade image quality if not carefully implemented",
            "Vulnerable to sophisticated attacks and removal techniques",
            "Limited payload capacity for embedding information",
            "Computational overhead for embedding and extraction",
            "Trade-off between robustness and imperceptibility",
          ]}
          complexity="Intermediate"
          keySize="Variable payload"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FileUploadForm
              title="Digital Watermarking Operations"
              description="Upload an image and configure watermarking settings"
              fields={formFields}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
          </div>

          <OutputDisplay
            title="Watermarking Result"
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
