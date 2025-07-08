"use client";

import { useState } from "react";
import { ExplanationCard } from "@/components/explanation-card";
import { OutputDisplay } from "@/components/output-display";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
import { Loader2, Play, Key, Lock, Unlock } from "lucide-react";
import { rsaAPI } from "@/lib/api";
import { RSAWalkthrough } from "@/components/rsa-walkthrough";

export default function RSAPage() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, string | number>>({});
  const [formData, setFormData] = useState<Record<string, string>>({
    operation: "",
    keySize: "64",
    message: "",
    p: "",
    q: "",
    e: "",
    d: "",
  });
  const [calculatedN, setCalculatedN] = useState<number | null>(null);

  // Calculate n and φ(n) when p and q change
  const calculateValues = (p: string, q: string) => {
    const pNum = parseInt(p);
    const qNum = parseInt(q);
    if (!isNaN(pNum) && !isNaN(qNum)) {
      const n = pNum * qNum;
      const phi = (pNum - 1) * (qNum - 1);
      setCalculatedN(n);
      return { n, phi };
    }
    setCalculatedN(null);
    return null;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Calculate n when p or q changes
    if (name === "p" || name === "q") {
      const newData = { ...formData, [name]: value };
      calculateValues(newData.p, newData.q);
    }

    if (error) setError("");
  };

  const isFieldDisabled = (fieldName: string) => {
    const operation = formData.operation;

    switch (fieldName) {
      case "keySize":
        return operation !== "generate";
      case "message":
        return operation === "generate";
      case "p":
      case "q":
        return operation === "generate";
      case "e":
        return operation === "generate" || operation === "decrypt";
      case "d":
        return operation === "generate" || operation === "encrypt";
      default:
        return false;
    }
  };

  const getFieldPlaceholder = (fieldName: string) => {
    const operation = formData.operation;

    switch (fieldName) {
      case "message":
        if (operation === "encrypt")
          return "Enter number to encrypt (e.g., 42)";
        if (operation === "decrypt")
          return "Enter ciphertext number to decrypt";
        return "Message field";
      case "p":
        return operation === "generate"
          ? "Auto-generated"
          : "Enter first prime number (e.g., 11)";
      case "q":
        return operation === "generate"
          ? "Auto-generated"
          : "Enter second prime number (e.g., 13)";
      case "e":
        if (operation === "encrypt") return "Enter public exponent (e.g., 3)";
        return operation === "generate" ? "Auto-generated" : "Public exponent";
      case "d":
        if (operation === "decrypt") return "Enter private exponent";
        return operation === "generate" ? "Auto-generated" : "Private exponent";
      default:
        return "";
    }
  };

  // Helper function to get message as integer (numbers only)
  const getMessageAsInt = (message: string) => {
    const numericValue = parseInt(message);
    if (!isNaN(numericValue) && numericValue.toString() === message.trim()) {
      return numericValue;
    }
    return NaN; // Invalid input - not a number
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult("");
    setMetadata({});

    try {
      let response: any;

      switch (formData.operation) {
        case "generate":
          const keySize = parseInt(formData.keySize) || 64;
          response = await rsaAPI.generateKeypair(keySize);
          if (response.success) {
            const pubKey = response.public_key;
            const privKey = response.private_key;

            // Auto-fill the form fields with generated values
            setFormData((prev) => ({
              ...prev,
              p: response.p.toString(),
              q: response.q.toString(),
              e: pubKey.e.toString(),
              d: privKey.d.toString(),
            }));

            setCalculatedN(pubKey.n);

            setResult(
              `RSA Key Generation Complete!\n\n` +
                `Step 1: Generated Primes\n` +
                `Prime p: ${response.p}\n` +
                `Prime q: ${response.q}\n\n` +
                `Step 2: Calculate Modulus\n` +
                `n = p × q = ${response.p} × ${response.q} = ${pubKey.n}\n\n` +
                `Step 3: Calculate Euler's Totient\n` +
                `φ(n) = (p-1)(q-1) = ${response.p - 1} × ${response.q - 1} = ${
                  response.phi
                }\n\n` +
                `Step 4: Choose Public Exponent\n` +
                `e = ${pubKey.e} (coprime with φ(n))\n\n` +
                `Step 5: Calculate Private Exponent\n` +
                `d = ${privKey.d} (where e×d ≡ 1 mod φ(n))\n\n` +
                `✓ RSA Key Pair Generated Successfully!`
            );
            setMetadata({
              Operation: "Key Generation",
              "Key Size": `${response.key_size} bits`,
              Algorithm: "Simple RSA",
              "Prime p": response.p,
              "Prime q": response.q,
              "n (modulus)": pubKey.n,
              "φ(n) (totient)": response.phi,
              "e (public exponent)": pubKey.e,
              "d (private exponent)": privKey.d,
            });
          }
          break;

        case "encrypt":
          const p = parseInt(formData.p) || 0;
          const q = parseInt(formData.q) || 0;
          const e = parseInt(formData.e) || 0;

          const n = p * q;

          response = await rsaAPI.encryptWithParams({
            plaintext: formData.message,
            p: p,
            q: q,
            e: e,
          });

          if (response.success) {
            setResult(
              `Encryption Successful!\n\n` +
                `Original Message: ${formData.message}\n` +
                `Message as Integer: ${response.message_as_int}\n` +
                `Ciphertext: ${response.ciphertext}\n\n` +
                `Encryption Process:\n` +
                `C = M^e mod n\n` +
                `C = ${response.message_as_int}^${e} mod ${n}\n` +
                `C = ${response.ciphertext}`
            );
            setMetadata({
              Operation: "Encryption",
              Algorithm: "Standard RSA",
              "Original Message": formData.message,
              "Message as Integer": response.message_as_int,
              "Prime p": p,
              "Prime q": q,
              "n (p×q)": n,
              "e (public exponent)": e,
              Ciphertext: response.ciphertext,
            });
          }
          break;

        case "decrypt":
          const pDec = parseInt(formData.p) || 0;
          const qDec = parseInt(formData.q) || 0;
          const d = parseInt(formData.d) || 0;

          const nDec = pDec * qDec;

          response = await rsaAPI.decryptWithParams({
            ciphertext: formData.message,
            p: pDec,
            q: qDec,
            d: d,
          });

          if (response.success) {
            setResult(
              `Decryption Successful!\n\n` +
                `Ciphertext: ${formData.message}\n` +
                `Decrypted Number: ${response.decrypted_int}\n` +
                `Decrypted Message: ${response.plaintext}\n\n` +
                `Decryption Process:\n` +
                `M = C^d mod n\n` +
                `M = ${formData.message}^${d} mod ${nDec}\n` +
                `M = ${response.decrypted_int}`
            );
            setMetadata({
              Operation: "Decryption",
              Algorithm: "Standard RSA",
              Ciphertext: formData.message,
              "Prime p": pDec,
              "Prime q": qDec,
              "n (p×q)": nDec,
              "d (private exponent)": d,
              "Decrypted Number": response.decrypted_int,
            });
          }
          break;

        default:
          setError("Please select an operation");
          return;
      }

      if (!response.success) {
        setError(response.error || "Operation failed");
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
            <h1 className="text-2xl font-bold">RSA Algorithm</h1>
            <p className="text-muted-foreground">
              Rivest-Shamir-Adleman Public Key Cryptography
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
          <ExplanationCard
            title="RSA (Rivest-Shamir-Adleman)"
            description="A widely-used public-key cryptosystem that enables secure data transmission. This is a pure numeric implementation following the standard mathematical RSA algorithm."
            theory="RSA is based on the mathematical difficulty of factoring large composite numbers. The algorithm uses four key parameters: two prime numbers (p and q), a public exponent (e), and a private exponent (d). The modulus n = p × q, and the totient φ(n) = (p-1)(q-1). The public key is (n, e) and private key is (n, d), where e×d ≡ 1 (mod φ(n)). Encryption: C = M^e mod n, Decryption: M = C^d mod n. All inputs and outputs are pure numbers."
            useCases={[
              "Educational demonstration of RSA mathematics with numbers",
              "Understanding public-key cryptography fundamentals",
              "Learning modular arithmetic and prime number theory",
              "Visualizing the RSA key generation process",
              "Step-by-step numeric encryption and decryption examples",
              "Exploring the relationship between RSA parameters",
            ]}
            pros={[
              "Pure mathematical RSA implementation",
              "Clear visualization of RSA mathematical steps",
              "Interactive parameter input for hands-on learning",
              "Shows detailed numeric encryption/decryption calculations",
              "Educational focus with manageable numbers",
            ]}
            cons={[
              "Uses small key sizes for demo purposes only",
              "Not suitable for real-world security applications",
              "Limited to numeric inputs only",
              "Requires understanding of modular arithmetic",
              "Manual parameter entry requires valid RSA parameters",
            ]}
            complexity="Educational"
            keySize="32-128 bits (demo)"
          />

          <RSAWalkthrough />

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  RSA Parameter-Based Operations
                </CardTitle>
                <CardDescription>
                  Enter RSA parameters (p, q, e, d) directly and see the
                  encryption/decryption results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Operation Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="operation">
                      Operation <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.operation}
                      onValueChange={(value) =>
                        handleFieldChange("operation", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operation..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generate">
                          Generate Key Pair
                        </SelectItem>
                        <SelectItem value="encrypt">Encrypt Message</SelectItem>
                        <SelectItem value="decrypt">Decrypt Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Key Size Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="keySize"
                      className="flex items-center gap-2"
                    >
                      Key Size (for generation)
                      {isFieldDisabled("keySize") && (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </Label>
                    <Select
                      value={formData.keySize}
                      onValueChange={(value) =>
                        handleFieldChange("keySize", value)
                      }
                      disabled={isFieldDisabled("keySize")}
                    >
                      <SelectTrigger
                        className={
                          isFieldDisabled("keySize") ? "opacity-50" : ""
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="32">32 bits (very fast)</SelectItem>
                        <SelectItem value="64">64 bits (fast)</SelectItem>
                        <SelectItem value="128">128 bits (medium)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message/Ciphertext Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="flex items-center gap-2"
                    >
                      {formData.operation === "decrypt"
                        ? "Ciphertext"
                        : "Message"}
                      {isFieldDisabled("message") && (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </Label>
                    <Input
                      id="message"
                      type="number"
                      placeholder={getFieldPlaceholder("message")}
                      value={formData.message}
                      onChange={(e) =>
                        handleFieldChange("message", e.target.value)
                      }
                      disabled={isFieldDisabled("message")}
                      className={isFieldDisabled("message") ? "opacity-50" : ""}
                    />
                    {formData.operation === "encrypt" && formData.message && (
                      <p className="text-xs text-blue-600">
                        Number input: {formData.message}
                      </p>
                    )}
                  </div>

                  {/* RSA Parameters Section */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">RSA Parameters</h4>
                      {calculatedN && (
                        <div className="text-sm text-muted-foreground">
                          n = p × q = {calculatedN}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Prime p */}
                      <div className="space-y-2">
                        <Label htmlFor="p" className="flex items-center gap-2">
                          Prime p
                          {isFieldDisabled("p") && (
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          )}
                        </Label>
                        <Input
                          id="p"
                          type="number"
                          placeholder={getFieldPlaceholder("p")}
                          value={formData.p}
                          onChange={(e) =>
                            handleFieldChange("p", e.target.value)
                          }
                          disabled={isFieldDisabled("p")}
                          className={isFieldDisabled("p") ? "opacity-50" : ""}
                        />
                      </div>

                      {/* Prime q */}
                      <div className="space-y-2">
                        <Label htmlFor="q" className="flex items-center gap-2">
                          Prime q
                          {isFieldDisabled("q") && (
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          )}
                        </Label>
                        <Input
                          id="q"
                          type="number"
                          placeholder={getFieldPlaceholder("q")}
                          value={formData.q}
                          onChange={(e) =>
                            handleFieldChange("q", e.target.value)
                          }
                          disabled={isFieldDisabled("q")}
                          className={isFieldDisabled("q") ? "opacity-50" : ""}
                        />
                      </div>

                      {/* Public exponent e */}
                      <div className="space-y-2">
                        <Label htmlFor="e" className="flex items-center gap-2">
                          Public Key (e)
                          {isFieldDisabled("e") ? (
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <Unlock className="w-3 h-3 text-green-500" />
                          )}
                        </Label>
                        <Input
                          id="e"
                          type="number"
                          placeholder={getFieldPlaceholder("e")}
                          value={formData.e}
                          onChange={(e) =>
                            handleFieldChange("e", e.target.value)
                          }
                          disabled={isFieldDisabled("e")}
                          className={isFieldDisabled("e") ? "opacity-50" : ""}
                        />
                      </div>

                      {/* Private exponent d */}
                      <div className="space-y-2">
                        <Label htmlFor="d" className="flex items-center gap-2">
                          Private Key (d)
                          {isFieldDisabled("d") ? (
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <Unlock className="w-3 h-3 text-green-500" />
                          )}
                        </Label>
                        <Input
                          id="d"
                          type="number"
                          placeholder={getFieldPlaceholder("d")}
                          value={formData.d}
                          onChange={(e) =>
                            handleFieldChange("d", e.target.value)
                          }
                          disabled={isFieldDisabled("d")}
                          className={isFieldDisabled("d") ? "opacity-50" : ""}
                        />
                      </div>
                    </div>

                    {/* RSA Formula Display */}
                    {formData.p && formData.q && (
                      <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                        <div>
                          n = p × q = {formData.p} × {formData.q} ={" "}
                          {calculatedN}
                        </div>
                        <div>
                          φ(n) = (p-1)(q-1) = {parseInt(formData.p) - 1} ×{" "}
                          {parseInt(formData.q) - 1} ={" "}
                          {(parseInt(formData.p) - 1) *
                            (parseInt(formData.q) - 1)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run{" "}
                        {formData.operation
                          ? formData.operation.charAt(0).toUpperCase() +
                            formData.operation.slice(1)
                          : "Algorithm"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <OutputDisplay
              title="RSA Result"
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
