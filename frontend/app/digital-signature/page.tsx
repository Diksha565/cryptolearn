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
import { 
  Loader2, 
  Key, 
  FileSignature, 
  ShieldCheck, 
  Zap, 
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { signatureAPI } from "@/lib/api";
import { DSAWalkthrough } from "@/components/dsa-walkthrough";

export default function DigitalSignaturePage() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, string | number>>({});
  const [activeTab, setActiveTab] = useState("keygen");

  // Form states for different operations
  const [keygenData, setKeygenData] = useState({
    algorithm: "RSA",
    keySize: 2048,
    curve: "secp256r1",
  });

  const [signData, setSignData] = useState({
    message: "",
    privateKey: "",
    algorithm: "RSA",
    hashAlgorithm: "SHA-256",
  });

  const [verifyData, setVerifyData] = useState({
    message: "",
    signature: "",
    publicKey: "",
    algorithm: "RSA",
    hashAlgorithm: "SHA-256",
  });

  const [signAndVerifyData, setSignAndVerifyData] = useState({
    message: "",
    algorithm: "RSA",
    keySize: 2048,
    curve: "secp256r1",
  });

  const algorithms = [
    { value: "RSA", label: "RSA (Rivest-Shamir-Adleman)" },
    { value: "ECC", label: "ECC (Elliptic Curve)" },
  ];

  const keySizes = [
    { value: 1024, label: "1024 bits (Not recommended)" },
    { value: 2048, label: "2048 bits (Standard)" },
    { value: 3072, label: "3072 bits (High security)" },
    { value: 4096, label: "4096 bits (Maximum security)" },
  ];

  const curves = [
    { value: "secp256r1", label: "secp256r1 (P-256)" },
    { value: "secp384r1", label: "secp384r1 (P-384)" },
    { value: "secp521r1", label: "secp521r1 (P-521)" },
  ];

  const hashAlgorithms = [
    { value: "SHA-1", label: "SHA-1 (Legacy, not recommended)" },
    { value: "SHA-256", label: "SHA-256 (Standard)" },
    { value: "SHA-384", label: "SHA-384 (High security)" },
    { value: "SHA-512", label: "SHA-512 (Maximum security)" },
  ];

  const resetResults = () => {
    setResult("");
    setError("");
    setMetadata({});
  };

  const handleKeyGeneration = async () => {
    setIsLoading(true);
    resetResults();

    try {
      let response;
      
      if (keygenData.algorithm === "RSA") {
        response = await signatureAPI.generateKeypair({
          algorithm: "RSA",
          key_size: keygenData.keySize,
        });
      } else {
        response = await signatureAPI.generateKeypair({
          algorithm: "ECC",
          curve: keygenData.curve,
        });
      }

      if (response.success) {
        const formattedResult = `Private Key:\n${response.private_key}\n\nPublic Key:\n${response.public_key}`;
        setResult(formattedResult);
        setMetadata({
          Algorithm: keygenData.algorithm,
          "Key Size": keygenData.algorithm === "RSA" ? `${keygenData.keySize} bits` : keygenData.curve,
          "Key Type": "Asymmetric",
          "Private Key Length": `${response.private_key?.length || 0} characters`,
          "Public Key Length": `${response.public_key?.length || 0} characters`,
          Purpose: "Digital Signature",
        });
      } else {
        setError(response.error || "Key generation failed");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during key generation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSigning = async () => {
    if (!signData.message || !signData.privateKey) {
      setError("Please provide both message and private key");
      return;
    }

    setIsLoading(true);
    resetResults();

    try {
      const response = await signatureAPI.sign({
        message: signData.message,
        private_key: signData.privateKey,
        algorithm: signData.algorithm,
        hash_algorithm: signData.hashAlgorithm,
      });

      if (response.success) {
        setResult(response.signature);
        setMetadata({
          Algorithm: signData.algorithm,
          Operation: "Digital Signature Creation",
          "Message Length": `${signData.message.length} characters`,
          "Signature Algorithm": response.signature_algorithm || `${signData.algorithm} with ${signData.hashAlgorithm}`,
          "Hash Algorithm": signData.hashAlgorithm,
        });
      } else {
        setError(response.error || "Signing failed");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during signing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verifyData.message || !verifyData.signature || !verifyData.publicKey) {
      setError("Please provide message, signature, and public key");
      return;
    }

    setIsLoading(true);
    resetResults();

    try {
      const response = await signatureAPI.verify({
        message: verifyData.message,
        signature: verifyData.signature,
        public_key: verifyData.publicKey,
        algorithm: verifyData.algorithm,
        hash_algorithm: verifyData.hashAlgorithm,
      });

      if (response.success) {
        const isValid = response.valid;
        const resultIcon = isValid ? "✓" : "✗";
        const resultColor = isValid ? "VALID" : "INVALID";
        setResult(`Signature Verification: ${resultColor} ${resultIcon}`);
        setMetadata({
          Algorithm: verifyData.algorithm,
          Operation: "Signature Verification",
          Result: isValid ? "Valid" : "Invalid",
          "Message Length": `${verifyData.message.length} characters`,
          "Hash Algorithm": verifyData.hashAlgorithm,
          "Verification Status": isValid ? "Authentic & Unmodified" : "Invalid or Tampered",
        });
      } else {
        setError(response.error || "Verification failed");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignAndVerify = async () => {
    if (!signAndVerifyData.message) {
      setError("Please provide a message to sign and verify");
      return;
    }

    setIsLoading(true);
    resetResults();

    try {
      let requestData: any = {
        message: signAndVerifyData.message,
        algorithm: signAndVerifyData.algorithm,
      };

      if (signAndVerifyData.algorithm === "RSA") {
        requestData.key_size = signAndVerifyData.keySize;
      } else {
        requestData.curve = signAndVerifyData.curve;
      }

      const response = await signatureAPI.signAndVerify(requestData);

      if (response.success) {
        const formattedResult = `COMPLETE DIGITAL SIGNATURE DEMONSTRATION\n\n` +
          `Message: "${response.original_message}"\n\n` +
          `Generated Keys:\n` +
          `Private Key: ${response.private_key}\n\n` +
          `Public Key: ${response.public_key}\n\n` +
          `Digital Signature: ${response.signature}\n\n` +
          `Verification Result: ${response.verification_result ? "VALID ✓" : "INVALID ✗"}\n\n` +
          `Proof of Integrity: ${response.verification_result ? "Message is authentic and unmodified" : "Message may have been tampered with"}`;
        
        setResult(formattedResult);
        setMetadata({
          Algorithm: signAndVerifyData.algorithm,
          Operation: "Complete Sign & Verify Demo",
          "Key Generation": "Successful",
          "Message Signing": "Successful",
          "Signature Verification": response.verification_result ? "Valid" : "Invalid",
          "Security Level": signAndVerifyData.algorithm === "RSA" ? `${signAndVerifyData.keySize} bits` : signAndVerifyData.curve,
        });
      } else {
        setError(response.error || "Sign and verify operation failed");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during the sign and verify operation");
    } finally {
      setIsLoading(false);
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
              Cryptographic Authentication and Non-Repudiation
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <ExplanationCard
          title="Digital Signature"
          description="A cryptographic mechanism that provides authentication, integrity, and non-repudiation for digital documents."
          theory="Digital signatures use public-key cryptography to create a unique digital fingerprint for documents. The process involves creating a hash of the document using a cryptographic hash function (like SHA-256), then encrypting this hash with the signer's private key. The resulting signature can be verified by anyone using the signer's public key to decrypt the signature and compare it with a fresh hash of the document. If they match, the signature is valid, proving the document hasn't been altered and was signed by the holder of the private key."
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
          keySize="2048-4096 bits (RSA) / 256-521 bits (ECC)"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Digital Signature Operations
              </CardTitle>
              <CardDescription>
                Generate keys, create signatures, and verify document authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="keygen" className="text-xs">
                    <Key className="h-3 w-3 mr-1" />
                    Keys
                  </TabsTrigger>
                  <TabsTrigger value="sign" className="text-xs">
                    <FileSignature className="h-3 w-3 mr-1" />
                    Sign
                  </TabsTrigger>
                  <TabsTrigger value="verify" className="text-xs">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verify
                  </TabsTrigger>
                  <TabsTrigger value="demo" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Demo
                  </TabsTrigger>
                  <TabsTrigger value="walkthrough" className="text-xs">
                    <Info className="h-3 w-3 mr-1" />
                    DSA
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="keygen" className="space-y-4">
                  <div>
                    <Label htmlFor="algorithm">Signature Algorithm</Label>
                    <Select
                      value={keygenData.algorithm}
                      onValueChange={(value) =>
                        setKeygenData((prev) => ({ ...prev, algorithm: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {algorithms.map((algo) => (
                          <SelectItem key={algo.value} value={algo.value}>
                            {algo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {keygenData.algorithm === "RSA" ? (
                    <div>
                      <Label htmlFor="keySize">Key Size</Label>
                      <Select
                        value={keygenData.keySize.toString()}
                        onValueChange={(value) =>
                          setKeygenData((prev) => ({ ...prev, keySize: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {keySizes.map((size) => (
                            <SelectItem key={size.value} value={size.value.toString()}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="curve">Elliptic Curve</Label>
                      <Select
                        value={keygenData.curve}
                        onValueChange={(value) =>
                          setKeygenData((prev) => ({ ...prev, curve: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {curves.map((curve) => (
                            <SelectItem key={curve.value} value={curve.value}>
                              {curve.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    onClick={handleKeyGeneration}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Key className="h-4 w-4 mr-2" />
                    )}
                    Generate {keygenData.algorithm} Key Pair
                  </Button>
                </TabsContent>

                <TabsContent value="sign" className="space-y-4">
                  <div>
                    <Label htmlFor="signAlgorithm">Algorithm</Label>
                    <Select
                      value={signData.algorithm}
                      onValueChange={(value) =>
                        setSignData((prev) => ({ ...prev, algorithm: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {algorithms.map((algo) => (
                          <SelectItem key={algo.value} value={algo.value}>
                            {algo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="signHashAlgorithm">Hash Algorithm</Label>
                    <Select
                      value={signData.hashAlgorithm}
                      onValueChange={(value) =>
                        setSignData((prev) => ({ ...prev, hashAlgorithm: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hashAlgorithms.map((hash) => (
                          <SelectItem key={hash.value} value={hash.value}>
                            {hash.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="signMessage">Message/Document to Sign</Label>
                    <Textarea
                      id="signMessage"
                      placeholder="Enter the message or document content to sign..."
                      value={signData.message}
                      onChange={(e) =>
                        setSignData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="signPrivateKey">Private Key (PEM format)</Label>
                    <Textarea
                      id="signPrivateKey"
                      placeholder="Enter your private key in PEM format..."
                      value={signData.privateKey}
                      onChange={(e) =>
                        setSignData((prev) => ({ ...prev, privateKey: e.target.value }))
                      }
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={handleSigning}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <FileSignature className="h-4 w-4 mr-2" />
                    )}
                    Create Digital Signature
                  </Button>
                </TabsContent>

                <TabsContent value="verify" className="space-y-4">
                  <div>
                    <Label htmlFor="verifyAlgorithm">Algorithm</Label>
                    <Select
                      value={verifyData.algorithm}
                      onValueChange={(value) =>
                        setVerifyData((prev) => ({ ...prev, algorithm: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {algorithms.map((algo) => (
                          <SelectItem key={algo.value} value={algo.value}>
                            {algo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="verifyHashAlgorithm">Hash Algorithm</Label>
                    <Select
                      value={verifyData.hashAlgorithm}
                      onValueChange={(value) =>
                        setVerifyData((prev) => ({ ...prev, hashAlgorithm: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hashAlgorithms.map((hash) => (
                          <SelectItem key={hash.value} value={hash.value}>
                            {hash.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="verifyMessage">Original Message/Document</Label>
                    <Textarea
                      id="verifyMessage"
                      placeholder="Enter the original message or document content..."
                      value={verifyData.message}
                      onChange={(e) =>
                        setVerifyData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="signature">Digital Signature</Label>
                    <Textarea
                      id="signature"
                      placeholder="Enter the digital signature to verify..."
                      value={verifyData.signature}
                      onChange={(e) =>
                        setVerifyData((prev) => ({ ...prev, signature: e.target.value }))
                      }
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="verifyPublicKey">Public Key (PEM format)</Label>
                    <Textarea
                      id="verifyPublicKey"
                      placeholder="Enter the signer's public key in PEM format..."
                      value={verifyData.publicKey}
                      onChange={(e) =>
                        setVerifyData((prev) => ({ ...prev, publicKey: e.target.value }))
                      }
                      rows={6}
                    />
                  </div>

                  <Button
                    onClick={handleVerification}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 mr-2" />
                    )}
                    Verify Digital Signature
                  </Button>
                </TabsContent>

                <TabsContent value="demo" className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Complete Demo</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      This will generate keys, sign your message, and verify the signature all in one operation.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="demoAlgorithm">Algorithm</Label>
                    <Select
                      value={signAndVerifyData.algorithm}
                      onValueChange={(value) =>
                        setSignAndVerifyData((prev) => ({ ...prev, algorithm: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {algorithms.map((algo) => (
                          <SelectItem key={algo.value} value={algo.value}>
                            {algo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {signAndVerifyData.algorithm === "RSA" ? (
                    <div>
                      <Label htmlFor="demoKeySize">Key Size</Label>
                      <Select
                        value={signAndVerifyData.keySize.toString()}
                        onValueChange={(value) =>
                          setSignAndVerifyData((prev) => ({ ...prev, keySize: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {keySizes.map((size) => (
                            <SelectItem key={size.value} value={size.value.toString()}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="demoCurve">Elliptic Curve</Label>
                      <Select
                        value={signAndVerifyData.curve}
                        onValueChange={(value) =>
                          setSignAndVerifyData((prev) => ({ ...prev, curve: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {curves.map((curve) => (
                            <SelectItem key={curve.value} value={curve.value}>
                              {curve.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="demoMessage">Message to Sign</Label>
                    <Textarea
                      id="demoMessage"
                      placeholder="Enter a message for the complete demo..."
                      value={signAndVerifyData.message}
                      onChange={(e) =>
                        setSignAndVerifyData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSignAndVerify}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Run Complete Demo
                  </Button>
                </TabsContent>

                <TabsContent value="walkthrough" className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Interactive DSA Process</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      Learn the complete Digital Signature Algorithm (DSA) process step by step. 
                      This interactive walkthrough shows how messages are signed with hash functions 
                      and verified for authenticity and integrity.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <FileSignature className="h-4 w-4" />
                          DSA Process Overview
                        </h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• <strong>Step 1-2:</strong> Message hashing with cryptographic functions</li>
                          <li>• <strong>Step 3-4:</strong> Bundle creation and private key signing</li>
                          <li>• <strong>Step 5-6:</strong> Secure transmission and public key verification</li>
                          <li>• <strong>Step 7-9:</strong> Hash comparison and integrity verification</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          Hash Functions Role
                        </h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• <strong>SHA-256:</strong> Most commonly used, 256-bit output</li>
                          <li>• <strong>SHA-384:</strong> Higher security, 384-bit output</li>
                          <li>• <strong>SHA-512:</strong> Maximum security, 512-bit output</li>
                          <li>• <strong>Collision Resistance:</strong> Prevents forgery attacks</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <OutputDisplay
            title="Digital Signature Result"
            result={result}
            error={error}
            metadata={metadata}
            isLoading={isLoading}
          />
        </div>

        {/* DSA Walkthrough Section */}
        <div className="mt-8">
          <DSAWalkthrough />
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Digital Signature Security Properties
            </CardTitle>
            <CardDescription>
              Understanding the cryptographic guarantees provided by digital signatures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <Badge variant="secondary" className="mb-2">Authentication</Badge>
                <p className="text-sm text-muted-foreground">
                  Verifies the identity of the signer and proves document origin
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-3">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <Badge variant="secondary" className="mb-2">Integrity</Badge>
                <p className="text-sm text-muted-foreground">
                  Detects any tampering or modification of the signed document
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex justify-center mb-3">
                  <XCircle className="h-8 w-8 text-purple-600" />
                </div>
                <Badge variant="secondary" className="mb-2">Non-Repudiation</Badge>
                <p className="text-sm text-muted-foreground">
                  Prevents the signer from denying that they signed the document
                </p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Security Considerations
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep private keys secure and encrypted</li>
                  <li>• Use strong key sizes (RSA ≥ 2048, ECC ≥ 256)</li>
                  <li>• Implement proper certificate management</li>
                  <li>• Consider quantum-resistant algorithms for future</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Key className="h-4 w-4 text-green-600" />
                  Best Practices
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use hardware security modules (HSMs) for high-value keys</li>
                  <li>• Implement proper key rotation policies</li>
                  <li>• Add timestamps to prevent replay attacks</li>
                  <li>• Validate certificates and check revocation lists</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
