"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OutputDisplayProps {
  title: string;
  result?: string;
  error?: string;
  metadata?: Record<string, string | number>;
  isLoading?: boolean;
  imageResult?: string;
}

export function OutputDisplay({
  title,
  result,
  error,
  metadata,
  isLoading,
  imageResult,
}: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Result copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cryptolearn-result-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Result saved to your downloads",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {isLoading ? "Processing..." : "Algorithm output and results"}
            </CardDescription>
          </div>
          {(result || error) && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!result}
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!result}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200">
                Error
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {metadata && Object.keys(metadata).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(metadata).map(([key, value]) => (
                  <Badge key={key} variant="secondary">
                    {key}: {value}
                  </Badge>
                ))}
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Result:</label>
              <Textarea
                value={result}
                readOnly
                className="font-mono text-sm min-h-[200px] resize-none"
                placeholder="Results will appear here..."
              />
            </div>

            {imageResult && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Result Image:
                </label>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${imageResult}`}
                    alt="Result"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `data:image/png;base64,${imageResult}`;
                    link.download = "result.png";
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
              </div>
            )}
          </div>
        )}

        {!result && !error && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p>No results yet. Run the algorithm to see output here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
