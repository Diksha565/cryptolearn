"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { aesAPI, rsaAPI, testAPI, healthCheck } from "@/lib/api";

export default function TestAPIPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, result: any, success: boolean) => {
    setResults((prev) => [
      ...prev,
      { test, result, success, timestamp: new Date().toISOString() },
    ]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // Test 1: Basic API connectivity
      try {
        console.log("Testing basic API connectivity...");
        const response = await testAPI();
        addResult("Basic API Test", response, true);
      } catch (error: any) {
        console.error("Basic API Test failed:", error);
        addResult(
          "Basic API Test",
          {
            error: error.message,
            details:
              "Check if backend server is running on http://127.0.0.1:5000",
          },
          false
        );
      }

      // Test 2: Health check
      try {
        console.log("Testing health check...");
        const response = await healthCheck();
        addResult("Health Check", response, true);
      } catch (error: any) {
        console.error("Health Check failed:", error);
        addResult(
          "Health Check",
          {
            error: error.message,
            details: "Backend health endpoint not responding",
          },
          false
        );
      }

      // Test 3: AES Encryption
      try {
        console.log("Testing AES encryption...");
        const response = await aesAPI.encrypt({
          plaintext: "Hello, World!",
          key: "my-secret-key",
          mode: "CBC",
          key_size: 256,
        });
        addResult(
          "AES Encryption",
          {
            success: response.success,
            has_ciphertext: !!response.ciphertext,
            ciphertext_length: response.ciphertext?.length || 0,
          },
          response.success
        );
      } catch (error: any) {
        console.error("AES Encryption failed:", error);
        addResult(
          "AES Encryption",
          {
            error: error.message,
            details: "AES encryption endpoint failed",
          },
          false
        );
      }

      // Test 4: RSA Key Generation
      try {
        console.log("Testing RSA key generation...");
        const response = await rsaAPI.generateKeypair(32);
        addResult(
          "RSA Key Generation",
          {
            success: response.success,
            key_size: response.key_size,
            has_public_key: !!response.public_key,
            has_private_key: !!response.private_key,
            public_key_n: response.public_key?.n || null,
            public_key_e: response.public_key?.e || null,
            private_key_d: response.private_key?.d || null,
            p: response.p,
            q: response.q,
            phi: response.phi,
          },
          response.success
        );
      } catch (error: any) {
        console.error("RSA Key Generation failed:", error);
        addResult(
          "RSA Key Generation",
          {
            error: error.message,
            details: "RSA key generation endpoint failed",
            endpoint: "/api/rsa/generate-keypair",
          },
          false
        );
      }

      // Test 5: Simple RSA Encryption (if key generation worked)
      try {
        console.log("Testing RSA encryption with generated keys...");
        const keyResponse = await rsaAPI.generateKeypair(32);
        if (keyResponse.success && keyResponse.public_key) {
          const encryptResponse = await rsaAPI.encrypt({
            plaintext: "Hi",
            public_key: keyResponse.public_key,
          });
          addResult(
            "RSA Encryption",
            {
              success: encryptResponse.success,
              has_ciphertext: !!encryptResponse.ciphertext,
              ciphertext: encryptResponse.ciphertext,
              public_key_used: keyResponse.public_key,
            },
            encryptResponse.success
          );
        } else {
          addResult(
            "RSA Encryption",
            {
              error: "Could not generate keys for encryption test",
            },
            false
          );
        }
      } catch (error: any) {
        console.error("RSA Encryption failed:", error);
        addResult(
          "RSA Encryption",
          {
            error: error.message,
            details: "RSA encryption test failed",
          },
          false
        );
      }
    } catch (error: any) {
      console.error("General test error:", error);
      addResult(
        "General Error",
        {
          error: error.message,
          details: "Unexpected error during testing",
        },
        false
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>API Integration Test</CardTitle>
            <CardDescription>
              Test the connection between frontend and backend APIs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} disabled={isLoading} className="w-full">
              {isLoading ? "Running Tests..." : "Run API Tests"}
            </Button>

            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                {results.map((result, index) => (
                  <Card
                    key={index}
                    className={
                      result.success ? "border-green-500" : "border-red-500"
                    }
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {result.success ? "✅" : "❌"} {result.test}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
