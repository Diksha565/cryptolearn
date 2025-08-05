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
import {
  Loader2,
  Key,
  Shield,
  Share,
  Info,
  ArrowRightLeft,
} from "lucide-react";
import { eccAPI } from "@/lib/api";

export default function ECCPage() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, string | number>>({});
  const [activeTab, setActiveTab] = useState("keygen");

  // Form states for different operations
  const [keygenData, setKeygenData] = useState({
    curve: "secp256r1",
    type: "ecdsa", // ecdsa or ecdh
  });

  const [signData, setSignData] = useState({
    message: "",
    privateKey: "",
  });

  const [verifyData, setVerifyData] = useState({
    message: "",
    signature: "",
    publicKey: "",
  });

  const [ecdhData, setEcdhData] = useState({
    privateKeyA: "",
    publicKeyBx: "",
    publicKeyBy: "",
    curve: "brainpoolP256r1",
  });

  const [curveInfoData, setCurveInfoData] = useState({
    curve: "secp256r1",
  });

  const curves = [
    { value: "secp256r1", label: "secp256r1 (P-256)" },
    { value: "secp384r1", label: "secp384r1 (P-384)" },
    { value: "secp521r1", label: "secp521r1 (P-521)" },
    { value: "brainpoolP256r1", label: "brainpoolP256r1" },
    { value: "brainpoolP384r1", label: "brainpoolP384r1" },
    { value: "brainpoolP512r1", label: "brainpoolP512r1" },
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

      if (keygenData.type === "ecdsa") {
        response = await eccAPI.generateKeypair(keygenData.curve);

        if (response.success) {
          const formattedResult = `Private Key:\n${response.private_key}\n\nPublic Key:\n${response.public_key}`;
          setResult(formattedResult);
          setMetadata({
            Algorithm: "ECDSA",
            Curve: response.curve || keygenData.curve,
            "Key Type": "Asymmetric",
            "Private Key Size": `${
              response.private_key?.length || 0
            } characters`,
            "Public Key Size": `${response.public_key?.length || 0} characters`,
          });
        } else {
          setError(response.error || "Key generation failed");
        }
      } else {
        response = await eccAPI.generateECDHKeypair(keygenData.curve);

        if (response.success) {
          const formattedResult = `Private Key:\n${response.private_key}\n\nPublic Key X:\n${response.public_key_x}\n\nPublic Key Y:\n${response.public_key_y}`;
          setResult(formattedResult);
          setMetadata({
            Algorithm: "ECDH",
            Curve: response.curve || keygenData.curve,
            "Key Type": "Key Exchange",
            "Private Key": response.private_key || "Generated",
            "Public Key Format": "Coordinate Pair (x, y)",
          });
        } else {
          setError(response.error || "ECDH key generation failed");
        }
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
      const response = await eccAPI.sign({
        message: signData.message,
        private_key: signData.privateKey,
      });

      if (response.success) {
        setResult(response.signature);
        setMetadata({
          Algorithm: "ECDSA",
          Operation: "Digital Signature",
          "Message Length": `${signData.message.length} characters`,
          "Signature Format": "DER encoded",
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
      const response = await eccAPI.verify({
        message: verifyData.message,
        signature: verifyData.signature,
        public_key: verifyData.publicKey,
      });

      if (response.success) {
        const isValid = response.valid;
        setResult(
          `Signature Verification: ${isValid ? "VALID ✓" : "INVALID ✗"}`
        );
        setMetadata({
          Algorithm: "ECDSA",
          Operation: "Signature Verification",
          Result: isValid ? "Valid" : "Invalid",
          "Message Length": `${verifyData.message.length} characters`,
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

  const handleECDHSharedSecret = async () => {
    if (
      !ecdhData.privateKeyA ||
      !ecdhData.publicKeyBx ||
      !ecdhData.publicKeyBy
    ) {
      setError("Please provide private key A and public key B coordinates");
      return;
    }

    setIsLoading(true);
    resetResults();

    try {
      const response = await eccAPI.ecdhSharedSecret({
        private_key_a: ecdhData.privateKeyA,
        public_key_b_x: ecdhData.publicKeyBx,
        public_key_b_y: ecdhData.publicKeyBy,
        curve: ecdhData.curve,
      });

      if (response.success) {
        setResult(response.shared_secret);
        setMetadata({
          Algorithm: "ECDH",
          Operation: "Shared Secret Calculation",
          Curve: ecdhData.curve,
          "Shared Secret": "Generated successfully",
        });
      } else {
        setError(response.error || "Shared secret calculation failed");
      }
    } catch (error: any) {
      setError(
        error.message || "An error occurred during shared secret calculation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurveInfo = async () => {
    setIsLoading(true);
    resetResults();

    try {
      const response = await eccAPI.getCurveInfo(curveInfoData.curve);

      if (response.success) {
        const info = response.curve_info;
        const formattedResult = `Curve: ${info.name}\nField Size: ${info.field_size} bits\nOrder: ${info.order}\nCofactor: ${info.cofactor}\n\nGenerator Point:\nX: ${info.generator_x}\nY: ${info.generator_y}\n\nSecurity Level: ${info.security_level} bits`;
        setResult(formattedResult);
        setMetadata({
          "Curve Name": info.name,
          "Field Size": `${info.field_size} bits`,
          "Security Level": `${info.security_level} bits`,
          Standard: info.standard || "Various",
        });
      } else {
        setError(response.error || "Failed to get curve information");
      }
    } catch (error: any) {
      setError(
        error.message || "An error occurred while fetching curve information"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">
              ECC (Elliptic Curve Cryptography)
            </h1>
            <p className="text-muted-foreground">
              Modern asymmetric cryptography with smaller keys
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <ExplanationCard
          title="ECC (Elliptic Curve Cryptography)"
          description="A public-key cryptographic approach based on the algebraic structure of elliptic curves over finite fields."
          theory="ECC is based on the mathematical properties of elliptic curves. The security relies on the Elliptic Curve Discrete Logarithm Problem (ECDLP), which is computationally hard to solve. ECC provides the same level of security as RSA with much smaller key sizes, making it more efficient for resource-constrained environments. The algorithm uses point multiplication on elliptic curves where finding the discrete logarithm is infeasible with current technology."
          useCases={[
            "Mobile device security and IoT applications",
            "TLS/SSL certificates and HTTPS connections",
            "Bitcoin and cryptocurrency transactions",
            "Smart card and embedded system security",
            "Digital signatures and authentication",
            "Key exchange protocols (ECDH)",
          ]}
          pros={[
            "Smaller key sizes compared to RSA for same security level",
            "Faster computations and lower power consumption",
            "Suitable for resource-constrained environments",
            "Strong mathematical foundation with no known attacks",
            "Supports both digital signatures (ECDSA) and key exchange (ECDH)",
          ]}
          cons={[
            "More complex mathematical implementation",
            "Potential vulnerability to quantum computers",
            "Curve parameter selection is critical for security",
            "Less widely understood than traditional RSA",
            "Side-channel attack considerations in implementation",
          ]}
          complexity="High"
          keySize="256-521 bits"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                ECC Operations
              </CardTitle>
              <CardDescription>
                Perform various elliptic curve cryptographic operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="keygen" className="text-xs">
                    <Key className="h-3 w-3 mr-1" />
                    Keys
                  </TabsTrigger>
                  <TabsTrigger value="sign" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Sign
                  </TabsTrigger>
                  <TabsTrigger value="verify" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Verify
                  </TabsTrigger>
                  <TabsTrigger value="ecdh" className="text-xs">
                    <Share className="h-3 w-3 mr-1" />
                    ECDH
                  </TabsTrigger>
                  <TabsTrigger value="info" className="text-xs">
                    <Info className="h-3 w-3 mr-1" />
                    Info
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="keygen" className="space-y-4">
                  <div>
                    <Label htmlFor="keyType">Key Type</Label>
                    <Select
                      value={keygenData.type}
                      onValueChange={(value) =>
                        setKeygenData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecdsa">
                          ECDSA (Digital Signature)
                        </SelectItem>
                        <SelectItem value="ecdh">
                          ECDH (Key Exchange)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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
                    Generate {keygenData.type.toUpperCase()} Key Pair
                  </Button>
                </TabsContent>

                <TabsContent value="sign" className="space-y-4">
                  <div>
                    <Label htmlFor="signMessage">Message to Sign</Label>
                    <Textarea
                      id="signMessage"
                      placeholder="Enter message to sign..."
                      value={signData.message}
                      onChange={(e) =>
                        setSignData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="signPrivateKey">Private Key</Label>
                    <Textarea
                      id="signPrivateKey"
                      placeholder="Enter ECDSA private key..."
                      value={signData.privateKey}
                      onChange={(e) =>
                        setSignData((prev) => ({
                          ...prev,
                          privateKey: e.target.value,
                        }))
                      }
                      rows={4}
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
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Sign Message
                  </Button>
                </TabsContent>

                <TabsContent value="verify" className="space-y-4">
                  <div>
                    <Label htmlFor="verifyMessage">Original Message</Label>
                    <Textarea
                      id="verifyMessage"
                      placeholder="Enter original message..."
                      value={verifyData.message}
                      onChange={(e) =>
                        setVerifyData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="signature">Signature</Label>
                    <Textarea
                      id="signature"
                      placeholder="Enter signature to verify..."
                      value={verifyData.signature}
                      onChange={(e) =>
                        setVerifyData((prev) => ({
                          ...prev,
                          signature: e.target.value,
                        }))
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="verifyPublicKey">Public Key</Label>
                    <Textarea
                      id="verifyPublicKey"
                      placeholder="Enter ECDSA public key..."
                      value={verifyData.publicKey}
                      onChange={(e) =>
                        setVerifyData((prev) => ({
                          ...prev,
                          publicKey: e.target.value,
                        }))
                      }
                      rows={4}
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
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Verify Signature
                  </Button>
                </TabsContent>

                <TabsContent value="ecdh" className="space-y-4">
                  <div>
                    <Label htmlFor="ecdhCurve">Curve</Label>
                    <Select
                      value={ecdhData.curve}
                      onValueChange={(value) =>
                        setEcdhData((prev) => ({ ...prev, curve: value }))
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

                  <div>
                    <Label htmlFor="privateKeyA">Your Private Key</Label>
                    <Input
                      id="privateKeyA"
                      placeholder="Enter your private key..."
                      value={ecdhData.privateKeyA}
                      onChange={(e) =>
                        setEcdhData((prev) => ({
                          ...prev,
                          privateKeyA: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="publicKeyBx">
                      Other Party's Public Key X
                    </Label>
                    <Input
                      id="publicKeyBx"
                      placeholder="Enter public key X coordinate..."
                      value={ecdhData.publicKeyBx}
                      onChange={(e) =>
                        setEcdhData((prev) => ({
                          ...prev,
                          publicKeyBx: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="publicKeyBy">
                      Other Party's Public Key Y
                    </Label>
                    <Input
                      id="publicKeyBy"
                      placeholder="Enter public key Y coordinate..."
                      value={ecdhData.publicKeyBy}
                      onChange={(e) =>
                        setEcdhData((prev) => ({
                          ...prev,
                          publicKeyBy: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <Button
                    onClick={handleECDHSharedSecret}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                    )}
                    Calculate Shared Secret
                  </Button>
                </TabsContent>

                <TabsContent value="info" className="space-y-4">
                  <div>
                    <Label htmlFor="infoCurve">Select Curve</Label>
                    <Select
                      value={curveInfoData.curve}
                      onValueChange={(value) =>
                        setCurveInfoData((prev) => ({ ...prev, curve: value }))
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

                  <Button
                    onClick={handleCurveInfo}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Info className="h-4 w-4 mr-2" />
                    )}
                    Get Curve Information
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <OutputDisplay
            title="ECC Result"
            result={result}
            error={error}
            metadata={metadata}
            isLoading={isLoading}
          />
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              ECC vs RSA Comparison
            </CardTitle>
            <CardDescription>
              Understanding the advantages of Elliptic Curve Cryptography
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Badge variant="secondary" className="mb-2">
                  ECC-256
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Equivalent security to RSA-3072 with 256-bit keys
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge variant="secondary" className="mb-2">
                  Performance
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Faster operations and lower power consumption
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge variant="secondary" className="mb-2">
                  Applications
                </Badge>
                <p className="text-sm text-muted-foreground">
                  IoT, mobile devices, and blockchain technology
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
