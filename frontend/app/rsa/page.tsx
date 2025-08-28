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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Key,
  Lock,
  Unlock,
  FileText,
  Shield,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { RSAWalkthrough } from "@/components/rsa-walkthrough";
import { rsaAPI } from "@/lib/api";

interface RSAKeys {
  public_key: string;
  private_key: string;
  key_size: number;
  public_exponent: number;
  modulus: number;
  private_exponent?: number;
  p?: number;
  q?: number;
}

interface EncryptResult {
  ciphertext: string;
  original_length: number;
  encrypted_length: number;
  key_size: number;
  padding: string;
}

interface DecryptResult {
  plaintext: string;
  decrypted_length: number;
  key_size: number;
}

interface SignatureResult {
  signature: string;
  message_length: number;
  signature_algorithm: string;
  hash_algorithm: string;
}

interface VerificationResult {
  valid: boolean;
  message_length: number;
  signature_algorithm: string;
}

export default function RSAPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Key generation state
  const [keys, setKeys] = useState<RSAKeys | null>(null);
  const [keySize, setKeySize] = useState(2048);

  // Text encryption state
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [encryptResult, setEncryptResult] = useState<EncryptResult | null>(
    null
  );
  const [decryptResult, setDecryptResult] = useState<DecryptResult | null>(
    null
  );

  // Signature state
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [signResult, setSignResult] = useState<SignatureResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(
    null
  );

  // Manual key input state
  const [manualPublicKey, setManualPublicKey] = useState("");
  const [manualPrivateKey, setManualPrivateKey] = useState("");

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleGenerateKeys = async () => {
    clearMessages();
    setLoading(true);

    try {
      const result = await rsaAPI.generateKeypair(keySize);

      if (result.success) {
        const keyData: RSAKeys = {
          public_key: result.public_key,
          private_key: result.private_key,
          key_size: result.key_size,
          public_exponent: result.public_exponent,
          modulus: result.modulus,
          private_exponent: result.private_exponent,
          p: result.p,
          q: result.q,
        };
        setKeys(keyData);
        setSuccess("RSA key pair generated successfully!");
      } else {
        setError(result.error || "Key generation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Key generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = async () => {
    clearMessages();
    if (!plaintext.trim()) {
      setError("Please enter text to encrypt");
      return;
    }

    const publicKey = manualPublicKey || keys?.public_key;
    if (!publicKey) {
      setError("Please generate keys or provide a public key");
      return;
    }

    setLoading(true);

    try {
      const result = await rsaAPI.encrypt({
        plaintext: plaintext.trim(),
        public_key: publicKey,
      });

      if (result.success) {
        setCiphertext(result.ciphertext);
        const encryptData: EncryptResult = {
          ciphertext: result.ciphertext,
          original_length: result.original_length,
          encrypted_length: result.encrypted_length,
          key_size: result.key_size,
          padding: result.padding,
        };
        setEncryptResult(encryptData);
        setSuccess("Text encrypted successfully!");
      } else {
        setError(result.error || "Encryption failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Encryption failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    clearMessages();
    if (!ciphertext.trim()) {
      setError("Please enter ciphertext to decrypt");
      return;
    }

    const privateKey = manualPrivateKey || keys?.private_key;
    if (!privateKey) {
      setError("Please generate keys or provide a private key");
      return;
    }

    setLoading(true);

    try {
      const result = await rsaAPI.decrypt({
        ciphertext: ciphertext.trim(),
        private_key: privateKey,
      });

      if (result.success) {
        const decryptData: DecryptResult = {
          plaintext: result.plaintext,
          decrypted_length: result.decrypted_length,
          key_size: result.key_size,
        };
        setDecryptResult(decryptData);
        setSuccess("Text decrypted successfully!");
      } else {
        setError(result.error || "Decryption failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decryption failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    clearMessages();
    if (!message.trim()) {
      setError("Please enter a message to sign");
      return;
    }

    const privateKey = manualPrivateKey || keys?.private_key;
    if (!privateKey) {
      setError("Please generate keys or provide a private key");
      return;
    }

    setLoading(true);

    try {
      const result = await rsaAPI.sign({
        message: message.trim(),
        private_key: privateKey,
      });

      if (result.success) {
        setSignature(result.signature);
        const signData: SignatureResult = {
          signature: result.signature,
          message_length: result.message_length,
          signature_algorithm: result.signature_algorithm,
          hash_algorithm: result.hash_algorithm,
        };
        setSignResult(signData);
        setSuccess("Message signed successfully!");
      } else {
        setError(result.error || "Signing failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    clearMessages();
    if (!message.trim() || !signature.trim()) {
      setError("Please enter both message and signature");
      return;
    }

    const publicKey = manualPublicKey || keys?.public_key;
    if (!publicKey) {
      setError("Please generate keys or provide a public key");
      return;
    }

    setLoading(true);

    try {
      const result = await rsaAPI.verify({
        message: message.trim(),
        signature: signature.trim(),
        public_key: publicKey,
      });

      if (result.success) {
        const verifyData: VerificationResult = {
          valid: result.valid,
          message_length: result.message_length,
          signature_algorithm: result.signature_algorithm,
        };
        setVerifyResult(verifyData);
        setSuccess(
          `Signature verification: ${result.valid ? "VALID" : "INVALID"}`
        );
      } else {
        setError(result.error || "Verification failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">RSA Encryption</h1>
          <p className="text-lg text-muted-foreground mb-6">
            RSA (Rivest-Shamir-Adleman) is a public-key cryptographic algorithm
            that enables secure communication and digital signatures using
            mathematically related key pairs.
          </p>

          {/* RSA Information Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  How RSA Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  RSA uses two large prime numbers to generate a public-private
                  key pair. The security relies on the difficulty of factoring
                  large numbers into their prime components.
                </p>
                <div className="space-y-1 text-xs">
                  <p>
                    <strong>Key Generation:</strong> Select primes p, q →
                    calculate n = p×q
                  </p>
                  <p>
                    <strong>Encryption:</strong> C = M^e mod n (using public
                    key)
                  </p>
                  <p>
                    <strong>Decryption:</strong> M = C^d mod n (using private
                    key)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Secure web communications (HTTPS/TLS)</li>
                  <li>• Email encryption (PGP/GPG)</li>
                  <li>• Digital certificates and PKI</li>
                  <li>• Code signing for software distribution</li>
                  <li>• VPN and secure messaging</li>
                  <li>• Blockchain and cryptocurrency</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security & Limitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Minimum 2048-bit keys recommended</li>
                  <li>• Slower than symmetric encryption</li>
                  <li>• Limited message size per operation</li>
                  <li>• Vulnerable to quantum computing</li>
                  <li>• Requires secure key management</li>
                  <li>• Side-channel attack considerations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="keygen" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="keygen" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Key Generation
            </TabsTrigger>
            <TabsTrigger value="encrypt" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Text Encryption
            </TabsTrigger>
            <TabsTrigger value="sign" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Digital Signature
            </TabsTrigger>
            <TabsTrigger
              value="walkthrough"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              RSA Walkthrough
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keygen">
            <Card>
              <CardHeader>
                <CardTitle>RSA Key Generation</CardTitle>
                <CardDescription>
                  Generate secure RSA key pairs for encryption and digital
                  signatures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Label htmlFor="keySize">Key Size:</Label>
                  <Select
                    value={keySize.toString()}
                    onValueChange={(value) => setKeySize(parseInt(value))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024">1024 bits</SelectItem>
                      <SelectItem value="2048">2048 bits</SelectItem>
                      <SelectItem value="3072">3072 bits</SelectItem>
                      <SelectItem value="4096">4096 bits</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleGenerateKeys}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                    Generate Keys
                  </Button>
                </div>

                {keys && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Public Key (PEM Format)</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(keys.public_key, "public")
                            }
                            className="h-8"
                          >
                            {copiedField === "public" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <Textarea
                          value={keys.public_key}
                          readOnly
                          rows={8}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Private Key (PEM Format)</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(keys.private_key, "private")
                            }
                            className="h-8"
                          >
                            {copiedField === "private" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <Textarea
                          value={keys.private_key}
                          readOnly
                          rows={8}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Key Size</Label>
                        <Badge variant="outline">{keys.key_size} bits</Badge>
                      </div>
                      <div className="space-y-2">
                        <Label>Public Exponent (e)</Label>
                        <Badge variant="outline">{keys.public_exponent}</Badge>
                      </div>
                      <div className="space-y-2">
                        <Label>Modulus Length</Label>
                        <Badge variant="outline">
                          {keys.modulus.toString().length} digits
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encrypt">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Text Encryption
                  </CardTitle>
                  <CardDescription>
                    Encrypt text messages using RSA-OAEP with SHA-256
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Plaintext</Label>
                    <Textarea
                      placeholder="Enter text to encrypt..."
                      value={plaintext}
                      onChange={(e) => setPlaintext(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Public Key (Optional - will use generated key if empty)
                    </Label>
                    <Textarea
                      placeholder="-----BEGIN PUBLIC KEY-----..."
                      value={manualPublicKey}
                      onChange={(e) => setManualPublicKey(e.target.value)}
                      rows={6}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Button
                    onClick={handleEncrypt}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    Encrypt
                  </Button>

                  {encryptResult && (
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Ciphertext (Base64)</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(ciphertext, "ciphertext")
                            }
                            className="h-8"
                          >
                            {copiedField === "ciphertext" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <Textarea
                          value={ciphertext}
                          readOnly
                          rows={4}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>Original Length</Label>
                          <p className="text-muted-foreground">
                            {encryptResult.original_length} bytes
                          </p>
                        </div>
                        <div>
                          <Label>Encrypted Length</Label>
                          <p className="text-muted-foreground">
                            {encryptResult.encrypted_length} bytes
                          </p>
                        </div>
                        <div>
                          <Label>Key Size</Label>
                          <p className="text-muted-foreground">
                            {encryptResult.key_size} bits
                          </p>
                        </div>
                        <div>
                          <Label>Padding</Label>
                          <p className="text-muted-foreground">
                            {encryptResult.padding}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unlock className="h-5 w-5" />
                    Text Decryption
                  </CardTitle>
                  <CardDescription>
                    Decrypt ciphertext using RSA private key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ciphertext (Base64)</Label>
                    <Textarea
                      placeholder="Enter base64 ciphertext..."
                      value={ciphertext}
                      onChange={(e) => setCiphertext(e.target.value)}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Private Key (Optional - will use generated key if empty)
                    </Label>
                    <Textarea
                      placeholder="-----BEGIN PRIVATE KEY-----..."
                      value={manualPrivateKey}
                      onChange={(e) => setManualPrivateKey(e.target.value)}
                      rows={6}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Button
                    onClick={handleDecrypt}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Unlock className="h-4 w-4 mr-2" />
                    )}
                    Decrypt
                  </Button>

                  {decryptResult && (
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label>Decrypted Text</Label>
                        <Textarea
                          value={decryptResult.plaintext}
                          readOnly
                          rows={4}
                          className="bg-green-50 text-black border-green-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>Decrypted Length</Label>
                          <p className="text-muted-foreground">
                            {decryptResult.decrypted_length} bytes
                          </p>
                        </div>
                        <div>
                          <Label>Key Size</Label>
                          <p className="text-muted-foreground">
                            {decryptResult.key_size} bits
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sign">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Digital Signature
                  </CardTitle>
                  <CardDescription>
                    Sign messages using RSA-PSS with SHA-256
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Message to Sign</Label>
                    <Textarea
                      placeholder="Enter message to sign..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleSign}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Sign Message
                  </Button>

                  {signResult && (
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Digital Signature (Base64)</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(signature, "signature")
                            }
                            className="h-8"
                          >
                            {copiedField === "signature" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <Textarea
                          value={signature}
                          readOnly
                          rows={4}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>Message Length</Label>
                          <p className="text-muted-foreground">
                            {signResult.message_length} bytes
                          </p>
                        </div>
                        <div>
                          <Label>Signature Algorithm</Label>
                          <p className="text-muted-foreground">
                            {signResult.signature_algorithm}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <Label>Hash Algorithm</Label>
                          <p className="text-muted-foreground">
                            {signResult.hash_algorithm}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Signature Verification
                  </CardTitle>
                  <CardDescription>
                    Verify digital signatures using RSA public key
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Signature (Base64)</Label>
                    <Textarea
                      placeholder="Enter signature to verify..."
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Verify Signature
                  </Button>

                  {verifyResult && (
                    <div className="space-y-3 p-4 bg-muted rounded-lg">
                      <div
                        className={`p-3 rounded-lg text-center font-medium ${
                          verifyResult.valid
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {verifyResult.valid
                          ? "✓ SIGNATURE VALID"
                          : "✗ SIGNATURE INVALID"}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>Message Length</Label>
                          <p className="text-muted-foreground">
                            {verifyResult.message_length} bytes
                          </p>
                        </div>
                        <div>
                          <Label>Algorithm</Label>
                          <p className="text-muted-foreground">
                            {verifyResult.signature_algorithm}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="walkthrough">
            <RSAWalkthrough />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
