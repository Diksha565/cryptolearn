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
  Shield,
  Share,
  Info,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSignature,
  Unlock,
  Hash,
  Zap,
} from "lucide-react";
import { eccAPI } from "@/lib/api";

export default function ECCPage() {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");
  const [metadata, setMetadata] = useState<Record<string, string | number>>({});

  // Key Generation States
  const [keyGenCurve, setKeyGenCurve] = useState("secp256r1");
  const [keyGenType, setKeyGenType] = useState("ecdsa");
  const [generatedPrivateKey, setGeneratedPrivateKey] = useState("");
  const [generatedPublicKey, setGeneratedPublicKey] = useState("");

  // Digital Signature States
  const [signMessage, setSignMessage] = useState("");
  const [signPrivateKey, setSignPrivateKey] = useState("");
  const [signature, setSignature] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [verifySignature, setVerifySignature] = useState("");
  const [verifyPublicKey, setVerifyPublicKey] = useState("");

  // ECDH Key Exchange States
  const [ecdhCurve, setEcdhCurve] = useState("secp256r1");
  const [ecdhPrivateKeyA, setEcdhPrivateKeyA] = useState("");
  const [ecdhPublicKeyA, setEcdhPublicKeyA] = useState("");
  const [ecdhPrivateKeyB, setEcdhPrivateKeyB] = useState("");
  const [ecdhPublicKeyB, setEcdhPublicKeyB] = useState("");
  const [sharedSecret, setSharedSecret] = useState("");

  const curves = [
    { value: "secp256r1", label: "secp256r1 (P-256) - Most Common", bits: 256 },
    { value: "secp384r1", label: "secp384r1 (P-384) - High Security", bits: 384 },
    { value: "secp521r1", label: "secp521r1 (P-521) - Maximum Security", bits: 521 },
  ];

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

  // Key Generation Handler
  const handleGenerateKeys = async () => {
    clearMessages();
    setLoading(true);
    
    try {
      let response;
      if (keyGenType === "ecdh") {
        // Use ECDH key generation endpoint
        response = await eccAPI.generateECDHKeypair(keyGenCurve);
        // Format ECDH keys for display
        setGeneratedPrivateKey(response.private_key);
        setGeneratedPublicKey(`X: ${response.public_key_x}\nY: ${response.public_key_y}`);
        
        // Auto-populate ECDH fields
        setEcdhPrivateKeyA(response.private_key);
        setEcdhPublicKeyA(`${response.public_key_x}, ${response.public_key_y}`);
      } else {
        // Use ECDSA key generation endpoint
        response = await eccAPI.generateKeypair(keyGenCurve);
        setGeneratedPrivateKey(response.private_key);
        setGeneratedPublicKey(response.public_key);
        
        // Auto-populate signing fields
        setSignPrivateKey(response.private_key);
        setVerifyPublicKey(response.public_key);
      }
      
      setResult("Key Pair Generated Successfully");
      setMetadata({
        curve: keyGenCurve,
        type: keyGenType,
        privateKeySize: response.private_key.length,
        publicKeySize: keyGenType === "ecdh" ? 
          (response.public_key_x.length + response.public_key_y.length) : 
          response.public_key.length,
        algorithm: keyGenType === "ecdh" ? "ECDH" : "ECDSA"
      });
      setSuccess("ECC key pair generated successfully! Keys auto-populated in respective fields.");
    } catch (error) {
      console.error("Error generating ECC keys:", error);
      setError("Failed to generate ECC key pair. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Digital Signature Handler
  const handleSign = async () => {
    clearMessages();
    setLoading(true);
    
    try {
      if (!signMessage.trim()) {
        setError("Please enter a message to sign");
        return;
      }
      if (!signPrivateKey.trim()) {
        setError("Please enter a private key");
        return;
      }

      const response = await eccAPI.sign(signPrivateKey, signMessage);
      setSignature(response.signature);
      setResult("Message Signed Successfully");
      setMetadata({
        messageLength: signMessage.length,
        signatureLength: response.signature.length,
        algorithm: "ECDSA",
      });
      setSuccess("Message signed successfully!");
    } catch (error) {
      console.error("Error signing message:", error);
      setError("Failed to sign message. Please check your private key.");
    } finally {
      setLoading(false);
    }
  };

  // Signature Verification Handler
  const handleVerify = async () => {
    clearMessages();
    setLoading(true);
    
    try {
      if (!verifyMessage.trim()) {
        setError("Please enter the original message");
        return;
      }
      if (!verifySignature.trim()) {
        setError("Please enter the signature to verify");
        return;
      }
      if (!verifyPublicKey.trim()) {
        setError("Please enter the public key");
        return;
      }

      const response = await eccAPI.verify(verifyPublicKey, verifyMessage, verifySignature);
      setResult(response.valid ? "Signature Verified ✓" : "Signature Invalid ✗");
      setMetadata({
        valid: response.valid,
        algorithm: "ECDSA",
        messageLength: verifyMessage.length,
        signatureLength: verifySignature.length,
      });
      
      if (response.valid) {
        setSuccess("Signature is valid! The message is authentic.");
      } else {
        setError("Signature verification failed. The message may have been tampered with.");
      }
    } catch (error) {
      console.error("Error verifying signature:", error);
      setError("Failed to verify signature. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  // ECDH Key Exchange Handler
  const handleECDH = async () => {
    clearMessages();
    setLoading(true);
    
    try {
      if (!ecdhPrivateKeyA.trim() || !ecdhPublicKeyB.trim()) {
        setError("Please enter both private key A and public key B");
        return;
      }

      // Parse public key B to extract X and Y coordinates
      // For ECDH, we expect the public key to be in hex format: "0x..." or just the hex values
      const publicKeyBParts = ecdhPublicKeyB.split(',');
      let public_key_b_x, public_key_b_y;
      
      if (publicKeyBParts.length === 2) {
        // Format: "0x123..., 0x456..." or "123..., 456..."
        public_key_b_x = publicKeyBParts[0].trim().replace('0x', '');
        public_key_b_y = publicKeyBParts[1].trim().replace('0x', '');
      } else {
        setError("Public key B must be in format: 'x_coordinate, y_coordinate' (hex values)");
        return;
      }

      const response = await eccAPI.ecdhSharedSecret({
        private_key_a: ecdhPrivateKeyA.replace('0x', ''),
        public_key_b_x: public_key_b_x,
        public_key_b_y: public_key_b_y,
        curve: ecdhCurve
      });
      
      setSharedSecret(response.shared_secret_hash);
      setResult("Shared Secret Computed Successfully");
      setMetadata({
        curve: ecdhCurve,
        secretLength: response.shared_secret_hash.length,
        algorithm: "ECDH",
      });
      setSuccess("ECDH shared secret computed successfully!");
    } catch (error) {
      console.error("Error computing ECDH shared secret:", error);
      setError("Failed to compute shared secret. Please check your keys format.");
    } finally {
      setLoading(false);
    }
  };

  // Generate ECDH Key Pairs
  const handleGenerateECDHKeys = async () => {
    clearMessages();
    setLoading(true);
    
    try {
      // Generate key pair A
      const responseA = await eccAPI.generateECDHKeypair(ecdhCurve);
      setEcdhPrivateKeyA(responseA.private_key);
      setEcdhPublicKeyA(`${responseA.public_key_x}, ${responseA.public_key_y}`);
      
      // Generate key pair B
      const responseB = await eccAPI.generateECDHKeypair(ecdhCurve);
      setEcdhPrivateKeyB(responseB.private_key);
      setEcdhPublicKeyB(`${responseB.public_key_x}, ${responseB.public_key_y}`);
      
      setSuccess("ECDH key pairs generated for both parties!");
    } catch (error) {
      console.error("Error generating ECDH keys:", error);
      setError("Failed to generate ECDH key pairs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex items-center p-4 border-b bg-muted/50">
        <SidebarTrigger className="mr-4" />
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">
            Elliptic Curve Cryptography (ECC)
          </h1>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Introduction */}
        <ExplanationCard
          title="Elliptic Curve Cryptography (ECC)"
          description="ECC provides the same security as RSA with much smaller key sizes, making it ideal for mobile and IoT devices with limited resources."
          theory="Elliptic Curve Cryptography is based on the algebraic structure of elliptic curves over finite fields. It relies on the difficulty of the Elliptic Curve Discrete Logarithm Problem (ECDLP), which is computationally harder to solve than the integer factorization problem used in RSA. This allows ECC to achieve the same level of security with significantly smaller key sizes - a 256-bit ECC key provides equivalent security to a 3072-bit RSA key."
          useCases={[
            "Mobile and IoT device security with limited processing power",
            "Digital signatures for software and document authentication",
            "Key exchange protocols (ECDH) for secure communications",
            "TLS/SSL certificates for web security",
            "Cryptocurrency transactions (Bitcoin, Ethereum)",
            "Smart card and embedded system security",
            "Virtual Private Networks (VPNs)",
            "Code signing for mobile applications"
          ]}
          pros={[
            "Smaller key sizes reduce storage and bandwidth requirements",
            "Faster key generation and digital signature operations",
            "Lower computational overhead and power consumption",
            "Equivalent security to RSA with 10x smaller keys",
            "Better performance on mobile and embedded devices",
            "Shorter certificate chains reduce network overhead",
            "Future-resistant against quantum computing advances"
          ]}
          cons={[
            "More complex mathematical operations than RSA",
            "Limited choice of standardized curves",
            "Potential implementation vulnerabilities if not done correctly",
            "Some curves may have government backdoors",
            "Requires careful selection of curve parameters",
            "Less widely understood than RSA among developers"
          ]}
          complexity="High"
          keySize="256-521 bits"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Smaller Keys</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  256-bit ECC key ≈ 3072-bit RSA key
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Strong Security</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on discrete logarithm problem
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold">Efficient</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Faster computation and lower memory usage
                </p>
              </Card>
            </div>
          </div>
        </ExplanationCard>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="keygen" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="keygen" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Key Generation
                </TabsTrigger>
                <TabsTrigger value="signature" className="flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  Digital Signature
                </TabsTrigger>
                <TabsTrigger value="verify" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Verify Signature
                </TabsTrigger>
                <TabsTrigger value="ecdh" className="flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  ECDH Exchange
                </TabsTrigger>
              </TabsList>

              {/* Key Generation Tab */}
              <TabsContent value="keygen">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      ECC Key Generation
                    </CardTitle>
                    <CardDescription>
                      Generate ECC key pairs for digital signatures or key exchange
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="curve">Elliptic Curve</Label>
                        <Select value={keyGenCurve} onValueChange={setKeyGenCurve}>
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
                      <div className="space-y-2">
                        <Label htmlFor="keyType">Key Type</Label>
                        <Select value={keyGenType} onValueChange={setKeyGenType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ecdsa">ECDSA (Digital Signature)</SelectItem>
                            <SelectItem value="ecdh">ECDH (Key Exchange)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateKeys}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Keys...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Generate Key Pair
                        </>
                      )}
                    </Button>

                    {/* Generated Keys Display */}
                    {generatedPrivateKey && (
                      <div className="space-y-4">
                        <Separator />
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium">Private Key</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generatedPrivateKey, "Private Key")}
                              >
                                Copy
                              </Button>
                            </div>
                            <Textarea
                              value={generatedPrivateKey}
                              readOnly
                              className="font-mono text-xs"
                              rows={3}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium">Public Key</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(generatedPublicKey, "Public Key")}
                              >
                                Copy
                              </Button>
                            </div>
                            <Textarea
                              value={generatedPublicKey}
                              readOnly
                              className="font-mono text-xs"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Digital Signature Tab */}
              <TabsContent value="signature">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSignature className="h-5 w-5" />
                      ECDSA Digital Signature
                    </CardTitle>
                    <CardDescription>
                      Sign a message using ECDSA with your private key
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signMessage">Message to Sign</Label>
                      <Textarea
                        id="signMessage"
                        placeholder="Enter the message you want to sign..."
                        value={signMessage}
                        onChange={(e) => setSignMessage(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signPrivateKey">Private Key</Label>
                        {signPrivateKey && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(signPrivateKey, "Private Key")}
                          >
                            Copy
                          </Button>
                        )}
                      </div>
                      <Textarea
                        id="signPrivateKey"
                        placeholder="Enter your private key (PEM format)... (Auto-filled when keys are generated)"
                        value={signPrivateKey}
                        onChange={(e) => setSignPrivateKey(e.target.value)}
                        className="font-mono text-xs"
                        rows={4}
                      />
                    </div>

                    <Button
                      onClick={handleSign}
                      disabled={loading || !signMessage.trim() || !signPrivateKey.trim()}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing Message...
                        </>
                      ) : (
                        <>
                          <FileSignature className="mr-2 h-4 w-4" />
                          Sign Message
                        </>
                      )}
                    </Button>

                    {/* Signature Display */}
                    {signature && (
                      <div className="space-y-3">
                        <Separator />
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Digital Signature</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(signature, "Signature")}
                            >
                              Copy
                            </Button>
                          </div>
                          <Textarea
                            value={signature}
                            readOnly
                            className="font-mono text-xs"
                            rows={4}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Signature Verification Tab */}
              <TabsContent value="verify">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Verify ECDSA Signature
                    </CardTitle>
                    <CardDescription>
                      Verify the authenticity of a signed message
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verifyMessage">Original Message</Label>
                      <Textarea
                        id="verifyMessage"
                        placeholder="Enter the original message..."
                        value={verifyMessage}
                        onChange={(e) => setVerifyMessage(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verifySignature">Signature</Label>
                      <Textarea
                        id="verifySignature"
                        placeholder="Enter the signature to verify..."
                        value={verifySignature}
                        onChange={(e) => setVerifySignature(e.target.value)}
                        className="font-mono text-xs"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="verifyPublicKey">Public Key</Label>
                        {verifyPublicKey && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(verifyPublicKey, "Public Key")}
                          >
                            Copy
                          </Button>
                        )}
                      </div>
                      <Textarea
                        id="verifyPublicKey"
                        placeholder="Enter the public key (PEM format)... (Auto-filled when keys are generated)"
                        value={verifyPublicKey}
                        onChange={(e) => setVerifyPublicKey(e.target.value)}
                        className="font-mono text-xs"
                        rows={4}
                      />
                    </div>

                    <Button
                      onClick={handleVerify}
                      disabled={loading || !verifyMessage.trim() || !verifySignature.trim() || !verifyPublicKey.trim()}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying Signature...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Verify Signature
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ECDH Key Exchange Tab */}
              <TabsContent value="ecdh">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share className="h-5 w-5" />
                      ECDH Key Exchange
                    </CardTitle>
                    <CardDescription>
                      Establish a shared secret between two parties using ECDH
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ecdhCurve">Elliptic Curve</Label>
                      <Select value={ecdhCurve} onValueChange={setEcdhCurve}>
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
                      onClick={handleGenerateECDHKeys}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Keys...
                        </>
                      ) : (
                        <>
                          <Key className="mr-2 h-4 w-4" />
                          Generate Key Pairs for Both Parties
                        </>
                      )}
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Party A</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="ecdhPrivateKeyA">Private Key A</Label>
                            {ecdhPrivateKeyA && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(ecdhPrivateKeyA, "Private Key A")}
                              >
                                Copy
                              </Button>
                            )}
                          </div>
                          <Textarea
                            id="ecdhPrivateKeyA"
                            placeholder="Private key for Party A (Auto-filled when keys are generated)"
                            value={ecdhPrivateKeyA}
                            onChange={(e) => setEcdhPrivateKeyA(e.target.value)}
                            className="font-mono text-xs"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="ecdhPublicKeyA">Public Key A</Label>
                            {ecdhPublicKeyA && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(ecdhPublicKeyA, "Public Key A")}
                              >
                                Copy
                              </Button>
                            )}
                          </div>
                          <Textarea
                            id="ecdhPublicKeyA"
                            placeholder="Public key for Party A (Auto-filled when keys are generated)"
                            value={ecdhPublicKeyA}
                            onChange={(e) => setEcdhPublicKeyA(e.target.value)}
                            className="font-mono text-xs"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Party B</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="ecdhPrivateKeyB">Private Key B</Label>
                            {ecdhPrivateKeyB && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(ecdhPrivateKeyB, "Private Key B")}
                              >
                                Copy
                              </Button>
                            )}
                          </div>
                          <Textarea
                            id="ecdhPrivateKeyB"
                            placeholder="Private key for Party B (Auto-filled when keys are generated)"
                            value={ecdhPrivateKeyB}
                            onChange={(e) => setEcdhPrivateKeyB(e.target.value)}
                            className="font-mono text-xs"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="ecdhPublicKeyB">Public Key B</Label>
                            {ecdhPublicKeyB && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(ecdhPublicKeyB, "Public Key B")}
                              >
                                Copy
                              </Button>
                            )}
                          </div>
                          <Textarea
                            id="ecdhPublicKeyB"
                            placeholder="Public key for Party B (Auto-filled when keys are generated)"
                            value={ecdhPublicKeyB}
                            onChange={(e) => setEcdhPublicKeyB(e.target.value)}
                            className="font-mono text-xs"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleECDH}
                      disabled={loading || !ecdhPrivateKeyA.trim() || !ecdhPublicKeyB.trim()}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Computing Shared Secret...
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          Compute Shared Secret
                        </>
                      )}
                    </Button>

                    {/* Shared Secret Display */}
                    {sharedSecret && (
                      <div className="space-y-3">
                        <Separator />
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Shared Secret</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(sharedSecret, "Shared Secret")}
                            >
                              Copy
                            </Button>
                          </div>
                          <Textarea
                            value={sharedSecret}
                            readOnly
                            className="font-mono text-xs"
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Status Messages */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Result Display */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5" />
                    Operation Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{result}</p>
                    </div>

                    {Object.keys(metadata).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Details:</h4>
                        <div className="space-y-1">
                          {Object.entries(metadata).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between text-sm"
                            >
                              <span className="capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>
                              <Badge variant="outline">
                                {typeof value === "boolean" 
                                  ? (value ? "✓" : "✗")
                                  : value
                                }
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}
