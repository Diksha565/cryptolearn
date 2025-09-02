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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Key,
  FileSignature,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Hash,
  Lock,
  Unlock,
} from "lucide-react";
import { signatureAPI } from "@/lib/api";
import { DSAWalkthrough } from "@/components/dsa-walkthrough";

export default function DigitalSignaturePage() {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [metadata, setMetadata] = useState<Record<string, string | number>>({});

  // RSA Digital Signature States
  const [rsaMessage, setRsaMessage] = useState("");
  const [rsaPrivateKey, setRsaPrivateKey] = useState("");
  const [rsaPublicKey, setRsaPublicKey] = useState("");
  const [rsaSignature, setRsaSignature] = useState("");
  const [rsaKeySize, setRsaKeySize] = useState<number>(2048);

  // Hash-Based Digital Signature States
  const [hashMessage, setHashMessage] = useState("");
  const [hashAlgorithm, setHashAlgorithm] = useState("SHA-256");
  const [hashSigningKey, setHashSigningKey] = useState("");
  const [hashSignature, setHashSignature] = useState("");
  const [hashVerificationKey, setHashVerificationKey] = useState("");

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setResult("");
    setMetadata({});
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(`${label} copied to clipboard!`);
    } catch (err) {
      setError(`Failed to copy ${label}`);
    }
  };

  // RSA Digital Signature Functions
  const handleRSAKeyGeneration = async () => {
    clearMessages();
    setLoading(true);
    try {
      const response = await signatureAPI.generateKeypair({
        algorithm: "RSA",
        key_size: rsaKeySize,
      });

      if (response.success) {
        setRsaPrivateKey(response.private_key);
        setRsaPublicKey(response.public_key);
        
        const formattedResult = `RSA Key Pair Generated Successfully!\n\n` +
          `Private Key:\n${response.private_key}\n\n` +
          `Public Key:\n${response.public_key}`;
        
        setResult(formattedResult);
        setMetadata({
          "Operation": "RSA Key Generation",
          "Algorithm": "RSA",
          "Key Size": `${rsaKeySize} bits`,
          "Private Key Length": `${response.private_key?.length || 0} characters`,
          "Public Key Length": `${response.public_key?.length || 0} characters`,
          "Security Level": rsaKeySize >= 2048 ? "High" : "Medium"
        });
        setSuccess("RSA key pair generated successfully!");
      } else {
        setError(response.error || "RSA key generation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "RSA key generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRSASign = async () => {
    clearMessages();
    if (!rsaMessage.trim()) {
      setError("Please enter a message to sign");
      return;
    }
    if (!rsaPrivateKey.trim()) {
      setError("Please provide RSA private key");
      return;
    }

    setLoading(true);
    try {
      const response = await signatureAPI.sign({
        message: rsaMessage.trim(),
        private_key: rsaPrivateKey.trim(),
        algorithm: "RSA",
      });

      if (response.success) {
        setRsaSignature(response.signature);
        
        const formattedResult = `RSA Digital Signature Created!\n\n` +
          `Message: "${rsaMessage.trim()}"\n\n` +
          `Digital Signature:\n${response.signature}`;
        
        setResult(formattedResult);
        setMetadata({
          "Operation": "RSA Digital Signature",
          "Algorithm": "RSA",
          "Message Length": `${rsaMessage.trim().length} characters`,
          "Signature Length": `${response.signature?.length || 0} characters`,
          "Hash Algorithm": "SHA-256",
          "Status": "Signed Successfully"
        });
        setSuccess("Message signed successfully with RSA!");
      } else {
        setError(response.error || "RSA signing failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "RSA signing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRSAVerify = async () => {
    clearMessages();
    if (!rsaMessage.trim()) {
      setError("Please enter the original message");
      return;
    }
    if (!rsaSignature.trim()) {
      setError("Please provide RSA signature");
      return;
    }
    if (!rsaPublicKey.trim()) {
      setError("Please provide RSA public key");
      return;
    }

    setLoading(true);
    try {
      const response = await signatureAPI.verify({
        message: rsaMessage.trim(),
        signature: rsaSignature.trim(),
        public_key: rsaPublicKey.trim(),
        algorithm: "RSA",
      });

      if (response.success) {
        const isValid = response.valid;
        const statusIcon = isValid ? "✅" : "❌";
        const statusText = isValid ? "VALID" : "INVALID";
        
        const formattedResult = `RSA Signature Verification Complete!\n\n` +
          `Message: "${rsaMessage.trim()}"\n\n` +
          `Verification Result: ${statusIcon} ${statusText}\n\n` +
          `Status: ${isValid ? "Signature is authentic and message is unmodified" : "Signature verification failed - message may be tampered"}`;
        
        setResult(formattedResult);
        setMetadata({
          "Operation": "RSA Signature Verification",
          "Algorithm": "RSA", 
          "Verification Result": statusText,
          "Message Length": `${rsaMessage.trim().length} characters`,
          "Authenticity": isValid ? "Verified" : "Failed",
          "Integrity": isValid ? "Intact" : "Compromised"
        });
        setSuccess("RSA signature verification completed!");
      } else {
        setError(response.error || "RSA verification failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "RSA verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Hash-Based Digital Signature Functions (Using Backend API)
  const handleHashSign = async () => {
    clearMessages();
    if (!hashMessage.trim()) {
      setError("Please enter a message to sign");
      return;
    }
    if (!hashSigningKey.trim()) {
      setError("Please provide a signing key");
      return;
    }

    setLoading(true);
    try {
      const response = await signatureAPI.hashSign({
        message: hashMessage.trim(),
        key: hashSigningKey.trim(),
        algorithm: hashAlgorithm,
      });

      if (response.success) {
        setHashSignature(response.signature);
        setHashVerificationKey(hashSigningKey.trim()); // Auto-populate verification key
        
        const formattedResult = `Hash-Based Digital Signature Created!\n\n` +
          `Message: "${hashMessage.trim()}"\n\n` +
          `Algorithm: HMAC-${hashAlgorithm}\n\n` +
          `Digital Signature:\n${response.signature}`;
        
        setResult(formattedResult);
        setMetadata({
          "Operation": "Hash-Based Digital Signature",
          "Algorithm": `HMAC-${hashAlgorithm}`,
          "Message Length": `${hashMessage.trim().length} characters`,
          "Signature Length": `${response.signature?.length || 0} characters`,
          "Key Type": "Symmetric (Shared Secret)",
          "Status": "Signed Successfully"
        });
        setSuccess("Message signed successfully with hash-based signature!");
      } else {
        setError(response.error || "Hash-based signing failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hash-based signing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleHashVerify = async () => {
    clearMessages();
    if (!hashMessage.trim()) {
      setError("Please enter the original message");
      return;
    }
    if (!hashSignature.trim()) {
      setError("Please provide hash signature");
      return;
    }
    if (!hashVerificationKey.trim()) {
      setError("Please provide verification key");
      return;
    }

    setLoading(true);
    try {
      const response = await signatureAPI.hashVerify({
        message: hashMessage.trim(),
        signature: hashSignature.trim(),
        key: hashVerificationKey.trim(),
        algorithm: hashAlgorithm,
      });

      if (response.success) {
        const isValid = response.valid;
        const statusIcon = isValid ? "✅" : "❌";
        const statusText = isValid ? "VALID" : "INVALID";
        
        const formattedResult = `Hash Signature Verification Complete!\n\n` +
          `Message: "${hashMessage.trim()}"\n\n` +
          `Algorithm: HMAC-${hashAlgorithm}\n\n` +
          `Verification Result: ${statusIcon} ${statusText}\n\n` +
          `Status: ${isValid ? "Signature is authentic and message is unmodified" : "Signature verification failed - message may be tampered"}`;
        
        setResult(formattedResult);
        setMetadata({
          "Operation": "Hash Signature Verification",
          "Algorithm": `HMAC-${hashAlgorithm}`,
          "Verification Result": statusText,
          "Message Length": `${hashMessage.trim().length} characters`,
          "Authenticity": isValid ? "Verified" : "Failed",
          "Integrity": isValid ? "Intact" : "Compromised"
        });
        setSuccess("Hash signature verification completed!");
      } else {
        setError(response.error || "Hash verification failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hash verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">Digital Signature</h1>
            <p className="text-muted-foreground">
              RSA-based and Hash-based Digital Signature Implementation
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <ExplanationCard
          title="Digital Signature"
          description="A cryptographic mechanism that provides authentication, integrity, and non-repudiation for digital documents using both RSA and hash-based approaches."
          theory="Digital signatures use cryptographic techniques to verify the authenticity and integrity of digital messages. RSA-based signatures use public-key cryptography where the private key signs the message and the public key verifies it. Hash-based signatures use symmetric keys with hash functions to create message authentication codes (MAC). Both methods ensure that the message hasn't been tampered with and confirm the identity of the sender."
          useCases={[
            "Document authentication and legal contracts",
            "Software code signing and distribution", 
            "Email security and message integrity",
            "Financial transactions and banking",
            "Government and regulatory compliance",
            "Medical records authentication",
            "Blockchain transactions",
            "API authentication and authorization",
          ]}
          pros={[
            "Strong authentication of document origin",
            "Ensures message integrity and detects tampering",
            "Non-repudiation prevents denial of signing",
            "Legally recognized in most jurisdictions",
            "Multiple implementation approaches available",
            "Scalable for enterprise deployments",
            "Can be combined with timestamps",
          ]}
          cons={[
            "Requires careful key management",
            "Private key compromise affects all signatures",
            "Computational overhead for signing/verification",
            "Certificate management complexity",
            "Vulnerable to quantum computing (RSA)",
            "Hash-based methods need secure key distribution",
            "Legal framework varies by jurisdiction",
          ]}
          complexity="Intermediate to Advanced"
          keySize="2048-4096 bits (RSA) / Variable length (Hash-based)"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Digital Signature Operations
              </CardTitle>
              <CardDescription>
                Create and verify digital signatures using RSA and hash-based methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="rsa-sign" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="rsa-sign" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    RSA Sign
                  </TabsTrigger>
                  <TabsTrigger value="rsa-verify" className="text-xs">
                    <Unlock className="h-3 w-3 mr-1" />
                    RSA Verify
                  </TabsTrigger>
                  <TabsTrigger value="hash-sign" className="text-xs">
                    <Hash className="h-3 w-3 mr-1" />
                    Hash Sign
                  </TabsTrigger>
                  <TabsTrigger value="walkthrough" className="text-xs">
                    <Info className="h-3 w-3 mr-1" />
                    Learn
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="rsa-sign" className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      RSA Digital Signature uses public-key cryptography. Generate keys first, then sign your message.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="rsaKeySize">RSA Key Size</Label>
                    <Select
                      value={rsaKeySize.toString()}
                      onValueChange={(value) => setRsaKeySize(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024">1024 bits (Fast, Less Secure)</SelectItem>
                        <SelectItem value="2048">2048 bits (Standard)</SelectItem>
                        <SelectItem value="3072">3072 bits (High Security)</SelectItem>
                        <SelectItem value="4096">4096 bits (Maximum Security)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleRSAKeyGeneration} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                    Generate RSA Key Pair
                  </Button>

                  <div>
                    <Label htmlFor="rsaMessage">Message to Sign</Label>
                    <Textarea
                      id="rsaMessage"
                      placeholder="Enter message to create RSA digital signature..."
                      value={rsaMessage}
                      onChange={(e) => setRsaMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="rsaPrivateKey">RSA Private Key (Generated)</Label>
                      {rsaPrivateKey && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(rsaPrivateKey, "Private Key")}
                        >
                          <FileSignature className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id="rsaPrivateKey"
                      placeholder="Private key will appear here after generation..."
                      value={rsaPrivateKey}
                      onChange={(e) => setRsaPrivateKey(e.target.value)}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Button onClick={handleRSASign} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileSignature className="h-4 w-4 mr-2" />}
                    Create RSA Digital Signature
                  </Button>

                  {rsaSignature && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>RSA Digital Signature</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(rsaSignature, "RSA Signature")}
                        >
                          <FileSignature className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={rsaSignature}
                        readOnly
                        rows={3}
                        className="font-mono text-xs bg-muted"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="rsa-verify" className="space-y-4">
                  <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription>
                      Verify RSA signature using the public key. Paste the signature and public key from the signing process.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="rsaVerifyMessage">Original Message</Label>
                    <Textarea
                      id="rsaVerifyMessage"
                      placeholder="Enter the original message that was signed..."
                      value={rsaMessage}
                      onChange={(e) => setRsaMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="rsaSignatureVerify">RSA Signature to Verify</Label>
                      {rsaSignature && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(rsaSignature, "RSA Signature")}
                        >
                          <FileSignature className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id="rsaSignatureVerify"
                      placeholder="Paste RSA signature here..."
                      value={rsaSignature}
                      onChange={(e) => setRsaSignature(e.target.value)}
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="rsaPublicKeyVerify">RSA Public Key</Label>
                      {rsaPublicKey && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(rsaPublicKey, "Public Key")}
                        >
                          <Key className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id="rsaPublicKeyVerify"
                      placeholder="Public key will appear here after key generation..."
                      value={rsaPublicKey}
                      onChange={(e) => setRsaPublicKey(e.target.value)}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Button onClick={handleRSAVerify} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Verify RSA Signature
                  </Button>
                </TabsContent>

                <TabsContent value="hash-sign" className="space-y-4">
                  <Alert>
                    <Hash className="h-4 w-4" />
                    <AlertDescription>
                      Hash-based signatures use symmetric keys with hash functions. Both signer and verifier must have the same key.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="hashAlgorithm">Hash Algorithm</Label>
                    <Select value={hashAlgorithm} onValueChange={setHashAlgorithm}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SHA-256">SHA-256</SelectItem>
                        <SelectItem value="SHA-384">SHA-384</SelectItem>
                        <SelectItem value="SHA-512">SHA-512</SelectItem>
                        <SelectItem value="MD5">MD5 (Not Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="hashMessage">Message to Sign</Label>
                    <Textarea
                      id="hashMessage"
                      placeholder="Enter message to create hash-based signature..."
                      value={hashMessage}
                      onChange={(e) => setHashMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hashSigningKey">Signing Key (Secret)</Label>
                    <Input
                      id="hashSigningKey"
                      type="password"
                      placeholder="Enter your secret signing key..."
                      value={hashSigningKey}
                      onChange={(e) => setHashSigningKey(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleHashSign} disabled={loading} className="w-full">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Hash className="h-4 w-4 mr-2" />}
                      Create Hash Signature
                    </Button>
                    <Button onClick={handleHashVerify} disabled={loading} variant="outline" className="w-full">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                      Verify Hash Signature
                    </Button>
                  </div>

                  {hashSignature && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Hash-based Signature</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(hashSignature, "Hash Signature")}
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={hashSignature}
                        readOnly
                        rows={2}
                        className="font-mono text-xs bg-muted"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="hashVerificationKey">Verification Key (Should match signing key)</Label>
                    <Input
                      id="hashVerificationKey"
                      type="password"
                      placeholder="Enter verification key..."
                      value={hashVerificationKey}
                      onChange={(e) => setHashVerificationKey(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="walkthrough" className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        Interactive Digital Signature Learning
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      Learn how digital signatures work step by step, including both RSA-based and hash-based approaches.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          RSA Digital Signature
                        </h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• <strong>Asymmetric:</strong> Uses public/private key pairs</li>
                          <li>• <strong>Security:</strong> Based on RSA algorithm strength</li>
                          <li>• <strong>Key Size:</strong> 2048-4096 bits recommended</li>
                          <li>• <strong>Use Case:</strong> Legal documents, code signing</li>
                        </ul>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Hash-Based Signature
                        </h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• <strong>Symmetric:</strong> Uses shared secret keys</li>
                          <li>• <strong>Security:</strong> Based on hash function strength</li>
                          <li>• <strong>Speed:</strong> Faster than RSA operations</li>
                          <li>• <strong>Use Case:</strong> API authentication, messages</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <OutputDisplay
            title="Digital Signature Results"
            result={result}
            error={error || undefined}
            metadata={metadata}
            isLoading={loading}
          />
        </div>

        {/* DSA Walkthrough Section */}
        <div className="mt-8">
          <DSAWalkthrough />
        </div>

        {/* Comparison Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              RSA vs Hash-Based Digital Signatures
            </CardTitle>
            <CardDescription>
              Understanding the differences between cryptographic signature approaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <Badge variant="secondary">RSA Digital Signature</Badge>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• <strong>Asymmetric cryptography</strong> - Public/private key pairs</li>
                  <li>• <strong>Non-repudiation</strong> - Cannot deny signing</li>
                  <li>• <strong>Key distribution</strong> - Public keys can be shared openly</li>
                  <li>• <strong>Computational cost</strong> - Higher due to large numbers</li>
                  <li>• <strong>Legal validity</strong> - Widely accepted in law</li>
                  <li>• <strong>Quantum vulnerability</strong> - Vulnerable to future quantum attacks</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="h-5 w-5 text-green-600" />
                  <Badge variant="secondary">Hash-Based Signature</Badge>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• <strong>Symmetric cryptography</strong> - Shared secret keys</li>
                  <li>• <strong>Message authentication</strong> - Proves message integrity</li>
                  <li>• <strong>Key management</strong> - Keys must be securely shared</li>
                  <li>• <strong>Performance</strong> - Much faster computation</li>
                  <li>• <strong>Simplicity</strong> - Easier to implement and understand</li>
                  <li>• <strong>Quantum resistance</strong> - Generally more quantum-resistant</li>
                </ul>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <Badge variant="secondary" className="mb-2">
                  Authentication
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Both methods verify the identity of the message sender
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-3">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <Badge variant="secondary" className="mb-2">
                  Integrity
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Both detect any tampering or modification of the message
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-3">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <Badge variant="secondary" className="mb-2">
                  Use Cases
                </Badge>
                <p className="text-sm text-muted-foreground">
                  RSA for legal/formal documents, Hash for API/system authentication
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
