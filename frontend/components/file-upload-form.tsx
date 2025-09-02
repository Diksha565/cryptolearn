"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Image, Loader2, Play } from "lucide-react";

interface FileUploadFormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "file";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  accept?: string; // For file inputs
  multiple?: boolean; // For file inputs
}

interface FileUploadFormProps {
  title: string;
  description: string;
  fields: FileUploadFormField[];
  onSubmit: (data: Record<string, string | File | File[]>) => void;
  isLoading?: boolean;
}

export function FileUploadForm({
  title,
  description,
  fields,
  onSubmit,
  isLoading = false,
}: FileUploadFormProps) {
  const [formData, setFormData] = useState<
    Record<string, string | File | File[]>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  const handleFieldChange = (name: string, value: string | File | File[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (name: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const field = fields.find((f) => f.name === name);
    if (field?.multiple) {
      handleFieldChange(name, Array.from(files));
    } else {
      handleFieldChange(name, files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === "text" && (
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  value={(formData[field.name] as string) || ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  className={errors[field.name] ? "border-red-500" : ""}
                />
              )}

              {field.type === "number" && (
                <Input
                  id={field.name}
                  type="number"
                  placeholder={field.placeholder}
                  value={(formData[field.name] as string) || ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  className={errors[field.name] ? "border-red-500" : ""}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={(formData[field.name] as string) || ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  className={errors[field.name] ? "border-red-500" : ""}
                  rows={4}
                />
              )}

              {field.type === "select" && field.options && (
                <Select
                  value={(formData[field.name] as string) || ""}
                  onValueChange={(value) =>
                    handleFieldChange(field.name, value)
                  }
                >
                  <SelectTrigger
                    className={errors[field.name] ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "file" && (
                <div className="space-y-2">
                  <Input
                    id={field.name}
                    type="file"
                    accept={field.accept}
                    multiple={field.multiple}
                    onChange={(e) =>
                      handleFileChange(field.name, e.target.files)
                    }
                    className={errors[field.name] ? "border-red-500" : ""}
                  />
                  {formData[field.name] && (
                    <div className="text-sm text-muted-foreground">
                      {field.multiple ? (
                        <div>
                          Selected files:{" "}
                          {(formData[field.name] as File[])
                            .map((f) => f.name)
                            .join(", ")}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          {(formData[field.name] as File).name}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {errors[field.name] && (
                <p className="text-sm text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Process Image
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
