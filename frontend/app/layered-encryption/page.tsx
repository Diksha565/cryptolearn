"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, Lock, Unlock, Key, Shield, CheckCircle2, XCircle, Info, Copy, Droplet, Eye, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { LayeredWalkthrough } from "@/components/layered-walkthrough"

interface EncryptionLayer {
  id: string
  name: string
  description: string
  enabled: boolean
  icon: string
}

interface EncryptionStep {
  step: number
  algorithm: string
  completed: boolean
}

interface LayerMetadata {
  layer: number
  algorithm: string
  input_size: number
  output_size: number
  key_size?: string
}

interface LayerOutput {
  layer: number
  name: string
  algorithm: string
  output: string
  metadata?: any
}

export default function LayeredEncryptionPage() {
  const [activeTab, setActiveTab] = useState("input")
  const [plaintext, setPlaintext] = useState("This is a secret message that needs maximum security!")
  const [senderIdentifier, setSenderIdentifier] = useState("Alice")
  const [coverText, setCoverText] = useState("")
  const [useECC, setUseECC] = useState(false)
  
  const [stegoText, setStegoText] = useState("")
  const [encryptedAESKey, setEncryptedAESKey] = useState("")
  const [digitalSignature, setDigitalSignature] = useState("")
  const [ciphertextHash, setCiphertextHash] = useState("")
  const [aesIV, setAesIV] = useState("")
  
  const [encryptedData, setEncryptedData] = useState("")
  const [decryptedData, setDecryptedData] = useState("")
  const [extractedWatermark, setExtractedWatermark] = useState("")
  const [signatureValid, setSignatureValid] = useState(false)
  const [hashValid, setHashValid] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [progress, setProgress] = useState(0)
  
  const [layers, setLayers] = useState<EncryptionLayer[]>([
    { id: "rsa", name: "RSA Encryption", description: "2048-bit asymmetric encryption (Layer 1)", enabled: true, icon: "🔑" },
    { id: "signature", name: "Digital Signature", description: "RSA-SHA256 signing (Layer 2)", enabled: true, icon: "✍️" },
    { id: "aes", name: "AES Encryption", description: "256-bit symmetric encryption (Layer 3)", enabled: true, icon: "�" }
  ])
  
  const [encryptionSteps, setEncryptionSteps] = useState<EncryptionStep[]>([])
  const [layerMetadata, setLayerMetadata] = useState<LayerMetadata[]>([])
  const [encryptionLayerOutputs, setEncryptionLayerOutputs] = useState<LayerOutput[]>([])
  const [decryptionLayerOutputs, setDecryptionLayerOutputs] = useState<any[]>([])
  const [keys, setKeys] = useState<any>(null)

  // Save encryption data to sessionStorage for recovery
  const saveEncryptionData = (data: any) => {
    try {
      sessionStorage.setItem('cryptolearn_encryption_data', JSON.stringify({
        keys: data.keys,
        stegoText: data.stegoText,
        encryptedAESKey: data.encryptedAESKey,
        digitalSignature: data.digitalSignature,
        ciphertextHash: data.ciphertextHash,
        aesIV: data.aesIV,
        useECC: data.useECC,
        timestamp: new Date().toISOString()
      }))
    } catch (err) {
      console.error('Failed to save encryption data:', err)
    }
  }

  // Load encryption data from sessionStorage
  const loadEncryptionData = () => {
    try {
      const saved = sessionStorage.getItem('cryptolearn_encryption_data')
      if (saved) {
        const data = JSON.parse(saved)
        setKeys(data.keys)
        setStegoText(data.stegoText)
        setEncryptedAESKey(data.encryptedAESKey)
        setDigitalSignature(data.digitalSignature)
        setCiphertextHash(data.ciphertextHash)
        setAesIV(data.aesIV)
        setUseECC(data.useECC)
        return true
      }
    } catch (err) {
      console.error('Failed to load encryption data:', err)
    }
    return false
  }

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, enabled: !layer.enabled } : layer
    ))
  }

  const getEnabledLayers = () => {
    return layers.filter(l => l.enabled).map(l => l.id)
  }

  const handleEncrypt = async () => {
    setError("")
    setSuccess("")
    setLoading(true)
    setProgress(0)
    setDecryptedData("") // Clear decryption results
    setExtractedWatermark("")
    setSignatureValid(false)
    setHashValid(false)

    try {
      if (!plaintext.trim()) {
        throw new Error("Please enter text to encrypt")
      }

      if (!senderIdentifier.trim()) {
        throw new Error("Please enter sender identifier")
      }

      // Generate keys if not already generated
      if (!keys) {
        setProgress(10)
        const keysResponse = await fetch('http://127.0.0.1:5000/api/advanced-layered/generate-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ use_ecc: useECC })
        })

        const keysData = await keysResponse.json()
        
        if (!keysData.success) {
          throw new Error(keysData.error || 'Key generation failed')
        }

        setKeys(keysData.keys)
      }

      setProgress(30)

      // Encrypt using 5-layer system
      const encryptResponse = await fetch('http://127.0.0.1:5000/api/advanced-layered/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plaintext,
          sender_identifier: senderIdentifier,
          keys,
          use_ecc: useECC,
          cover_text: coverText || undefined
        })
      })

      const encryptData = await encryptResponse.json()
      
      if (!encryptData.success) {
        throw new Error(encryptData.error || 'Encryption failed')
      }

      setProgress(100)
      
      // Store all encryption outputs  
      // Backend returns 'final_output' not 'stego_text'
      const finalOutput = encryptData.final_output || encryptData.stego_text
      const responseKeys = encryptData.keys // Use keys from encryption response
      
      setStegoText(finalOutput)
      setKeys(responseKeys) // Update keys state with response keys
      setEncryptedAESKey(encryptData.encrypted_aes_key)
      setDigitalSignature(encryptData.digital_signature)
      setCiphertextHash(encryptData.ciphertext_hash)
      setAesIV(encryptData.aes_iv)
      setEncryptionLayerOutputs(encryptData.layer_outputs || [])
      setEncryptedData(finalOutput) // Keep for compatibility
      
      // Save encryption data for recovery
      saveEncryptionData({
        keys: responseKeys, // Save keys from response, not from state
        stegoText: finalOutput,
        encryptedAESKey: encryptData.encrypted_aes_key,
        digitalSignature: encryptData.digital_signature,
        ciphertextHash: encryptData.ciphertext_hash,
        aesIV: encryptData.aes_iv,
        useECC
      })
      
      setSuccess('✓ Successfully encrypted through all 5 layers!')
      setActiveTab("results")

    } catch (err: any) {
      setError(err.message || 'Encryption failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDecrypt = async () => {
    setError("")
    setSuccess("")
    setLoading(true)
    setProgress(0)

    try {
      // Check if we have encrypted data, if not try to load from sessionStorage
      if (!stegoText || !keys) {
        const loaded = loadEncryptionData()
        if (!loaded) {
          throw new Error("No encrypted data available. Please encrypt a message first.")
        }
      }

      if (!stegoText) {
        throw new Error("No encrypted data available")
      }

      if (!keys) {
        throw new Error("Encryption keys not available. Please encrypt a message first.")
      }

      if (!encryptedAESKey || !digitalSignature || !ciphertextHash || !aesIV) {
        throw new Error("Missing encryption metadata. Please ensure all encryption data is available.")
      }

      setProgress(30)

      console.log('Decryption request:', {
        stegoTextLength: stegoText.length,
        hasKeys: !!keys,
        hasEncryptedAESKey: !!encryptedAESKey,
        hasDigitalSignature: !!digitalSignature,
        hasCiphertextHash: !!ciphertextHash,
        hasAesIV: !!aesIV,
        useECC,
        stegoTextPreview: stegoText.substring(0, 50) + '...',
        keyStructure: keys ? Object.keys(keys) : 'null',
        encryptedAESKeyLength: encryptedAESKey ? encryptedAESKey.length : 0,
        digitalSignatureLength: digitalSignature ? digitalSignature.length : 0,
        ciphertextHashLength: ciphertextHash ? ciphertextHash.length : 0,
        aesIVLength: aesIV ? aesIV.length : 0
      })

      const decryptResponse = await fetch('http://127.0.0.1:5000/api/advanced-layered/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stego_text: stegoText,
          keys,
          encrypted_aes_key: encryptedAESKey,
          digital_signature: digitalSignature,
          ciphertext_hash: ciphertextHash,
          aes_iv: aesIV,
          use_ecc: useECC
        })
      })

      const decryptData = await decryptResponse.json()
      
      console.log('Decryption response:', decryptData)
      
      if (!decryptData.success) {
        // Show detailed error information
        let errorMsg = decryptData.error || 'Decryption failed'
        if (decryptData.details) {
          if (typeof decryptData.details === 'string') {
            errorMsg += ': ' + decryptData.details
          } else if (decryptData.details.hint) {
            errorMsg += '\n\n💡 ' + decryptData.details.hint
          } else if (decryptData.details.message) {
            errorMsg += '\n\n' + decryptData.details.message
          }
        }
        
        // Add specific guidance for different failure types
        if (errorMsg.includes('Stego extraction') || errorMsg.includes('corrupted')) {
          errorMsg += '\n\n⚠️ The encrypted data was modified after encryption. Please use the encrypted data from the "Results" tab on this page, or re-encrypt your message.'
        } else if (errorMsg.includes('Digital signature verification failed')) {
          errorMsg += '\n\n🔍 This could be due to:'
          errorMsg += '\n• Keys mismatch between encryption and decryption'
          errorMsg += '\n• Corrupted signature or hash data'
          errorMsg += '\n• Wrong algorithm selection (RSA vs ECC)'
          errorMsg += '\n• Data corruption during transmission'
        }
        
        // Add debug information for development
        if (process.env.NODE_ENV === 'development') {
          console.error('Decryption error details:', decryptData)
          errorMsg += '\n\n🐛 Debug info (check console for full details):'
          errorMsg += `\n• Backend error: ${decryptData.error}`
          if (decryptData.layer_errors) {
            errorMsg += `\n• Layer errors: ${JSON.stringify(decryptData.layer_errors)}`
          }
        }
        
        throw new Error(errorMsg)
      }

      setProgress(100)
      setDecryptedData(decryptData.plaintext)
      setExtractedWatermark(decryptData.extracted_watermark)
      setSignatureValid(decryptData.signature_verified || false)
      setHashValid(decryptData.hash_verified || false)
      setDecryptionLayerOutputs(decryptData.decryption_steps || []) // Show decryption steps
      
      setSuccess('✓ Successfully decrypted through all 5 layers!')
      setActiveTab("decrypt")

    } catch (err: any) {
      setError(err.message || 'Decryption failed')
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setPlaintext("")
    setSenderIdentifier("")
    setCoverText("")
    setStegoText("")
    setEncryptedAESKey("")
    setDigitalSignature("")
    setCiphertextHash("")
    setAesIV("")
    setEncryptedData("")
    setDecryptedData("")
    setExtractedWatermark("")
    setSignatureValid(false)
    setHashValid(false)
    setKeys(null)
    setEncryptionLayerOutputs([])
    setDecryptionLayerOutputs([])
    setError("")
    setSuccess("")
    setProgress(0)
    sessionStorage.removeItem('cryptolearn_encryption_data')
    setSuccess("✓ All data cleared. Ready for new encryption.")
    setTimeout(() => setSuccess(""), 2000)
  }

  const testIntegrity = async () => {
    if (!stegoText || !keys) {
      setError("No encryption data available to test. Please encrypt first.")
      return
    }

    setError("")
    setSuccess("")

    try {
      // Test data integrity
      console.log("=== DATA INTEGRITY TEST ===")
      console.log("Stego text length:", stegoText.length)
      console.log("Keys available:", !!keys)
      console.log("Keys structure:", keys ? Object.keys(keys) : 'none')
      console.log("Encrypted AES key:", !!encryptedAESKey)
      console.log("Digital signature:", !!digitalSignature) 
      console.log("Ciphertext hash:", !!ciphertextHash)
      console.log("AES IV:", !!aesIV)
      console.log("Use ECC:", useECC)

      // Check for common corruption indicators
      const hasControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(stegoText)
      const hasUnicodeErrors = stegoText.includes('�')
      const expectedLength = stegoText.length > 5000 && stegoText.length < 20000

      console.log("Corruption checks:")
      console.log("- Has control chars:", hasControlChars)
      console.log("- Has unicode errors:", hasUnicodeErrors)
      console.log("- Length reasonable:", expectedLength)

      let warningMsg = "Data integrity check completed.\n"
      if (hasControlChars) warningMsg += "⚠️ Control characters detected\n"
      if (hasUnicodeErrors) warningMsg += "⚠️ Unicode corruption detected\n"
      if (!expectedLength) warningMsg += "⚠️ Unexpected text length\n"

      if (!hasControlChars && !hasUnicodeErrors && expectedLength) {
        warningMsg += "✅ Data appears intact - ready for decryption"
      } else {
        warningMsg += "❌ Data corruption detected - decryption may fail"
      }

      setSuccess(warningMsg)
      setTimeout(() => setSuccess(""), 5000)

    } catch (err: any) {
      setError("Integrity test failed: " + err.message)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("Copied to clipboard!")
    setTimeout(() => setSuccess(""), 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Advanced 5-Layer Encryption System</h1>
        <p className="text-muted-foreground text-lg">
          State-of-the-art multi-layer cryptographic workflow with watermarking and steganography
        </p>
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-semibold mb-2">5-Layer Encryption Flow:</p>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="font-semibold">Plaintext</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">Layer 1: AES-256</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-xs">Layer 2: Key Encryption</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">Layer 3: Watermark</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-xs">Layer 4: Signature</span>
            <ArrowRight className="h-4 w-4" />
            <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900 rounded text-xs">Layer 5: Linguistic Stego</span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-semibold">Stego Text</span>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Each layer adds security: confidentiality (AES), key protection (RSA/ECC), sender authentication (watermark), integrity (signature), covert communication (linguistic steganography)
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
          <TabsTrigger value="walkthrough">Walkthrough</TabsTrigger>
        </TabsList>

        {/* Input Tab */}
        <TabsContent value="input" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Input Configuration</CardTitle>
              <CardDescription>
                Enter your text, sender identifier, and configure encryption settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plaintext">Text to Encrypt</Label>
                <Textarea
                  id="plaintext"
                  value={plaintext}
                  onChange={(e) => setPlaintext(e.target.value)}
                  placeholder="Enter your message here..."
                  rows={6}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  {plaintext.length} characters
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sender">Sender Identifier (Watermark)</Label>
                  <Input
                    id="sender"
                    value={senderIdentifier}
                    onChange={(e) => setSenderIdentifier(e.target.value)}
                    placeholder="e.g., Alice, Bob, Organization"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be embedded as a hidden watermark
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="algorithm">Key Encryption Algorithm</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="algorithm"
                      checked={useECC}
                      onCheckedChange={setUseECC}
                    />
                    <Label htmlFor="algorithm" className="cursor-pointer">
                      {useECC ? "🔐 ECC (Elliptic Curve)" : "🔑 RSA (2048-bit)"}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {useECC ? "ECC provides equivalent security with smaller keys" : "RSA is widely supported and battle-tested"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Cover Text (Optional - for Steganography)</Label>
                <Textarea
                  id="cover"
                  value={coverText}
                  onChange={(e) => setCoverText(e.target.value)}
                  placeholder="Leave empty for auto-generated cover text..."
                  rows={3}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Custom cover text to hide the encrypted message (auto-generated if empty)
                </p>
              </div>

              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    5-Layer Security Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <span><strong>Layer 1:</strong> AES-256-CBC symmetric encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-green-600" />
                    <span><strong>Layer 2:</strong> {useECC ? "ECC" : "RSA"} key encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-yellow-600" />
                    <span><strong>Layer 3:</strong> Zero-width character watermarking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <span><strong>Layer 4:</strong> SHA-256 + {useECC ? "ECDSA" : "RSA"} signature</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-pink-600" />
                    <span><strong>Layer 5:</strong> Linguistic steganography (synonym substitution)</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button 
                  onClick={handleEncrypt} 
                  disabled={loading}
                  className="flex-1"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Encrypt (5 Layers)
                </Button>
                <Button 
                  onClick={resetAll} 
                  disabled={loading}
                  variant="outline"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Encryption Results</CardTitle>
              <CardDescription>
                Final encrypted output and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {stegoText ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Encrypted Stego Text (Final Output)</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(stegoText)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-600 dark:text-yellow-400 text-sm">
                        <strong>Linguistic Steganography:</strong> The encrypted data is hidden in natural-looking sentences using synonym substitution. 
                        The text may appear longer but reads like normal English text with simple sentences.
                      </AlertDescription>
                    </Alert>
                    <Textarea
                      value={stegoText}
                      readOnly
                      rows={6}
                      className="font-mono text-xs"
                    />
                    <p className="text-sm text-muted-foreground">
                      {stegoText.length} characters - Natural-looking text with hidden encrypted data using linguistic steganography
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Encryption Metadata</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Algorithm:</span>
                          <span className="ml-2 font-mono">{useECC ? 'ECC + ECDSA' : 'RSA + RSA-SHA256'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sender Watermark:</span>
                          <span className="ml-2 font-mono">{senderIdentifier}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Original Size:</span>
                          <span className="ml-2 font-mono">{plaintext.length} bytes</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stego Size:</span>
                          <span className="ml-2 font-mono">{stegoText.length} bytes</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hash:</span>
                          <span className="ml-2 font-mono text-xs">{ciphertextHash.substring(0, 16)}...</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Decryption Requirements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Stego text (visible above)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Private keys (stored)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Encrypted AES key</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Digital signature</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Hash & IV</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Layer-by-Layer Output Display */}
                  {encryptionLayerOutputs.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Layer-by-Layer Encryption Output</CardTitle>
                        <CardDescription>
                          See the actual encrypted output after each layer is applied
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {encryptionLayerOutputs.map((layer, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                    {layer.layer}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm">{layer.name}</h4>
                                    <p className="text-xs text-muted-foreground">{layer.algorithm}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(layer.output)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div>
                                <Label className="text-xs text-muted-foreground">Output ({layer.output.length} chars)</Label>
                                <div className="mt-1 p-2 bg-primary/5 border border-primary/20 rounded text-xs font-mono break-all">
                                  {layer.output.length > 200 
                                    ? `${layer.output.substring(0, 200)}...` 
                                    : layer.output
                                  }
                                </div>
                              </div>
                              
                              {layer.metadata && Object.keys(layer.metadata).length > 0 && (
                                <div className="text-xs text-muted-foreground space-y-1">
                                  {Object.entries(layer.metadata).map(([key, value]: [string, any]) => (
                                    <div key={key}>
                                      <span className="font-semibold">{key}:</span> {value?.toString().substring(0, 64)}
                                      {value?.toString().length > 64 && '...'}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-4">
                    <Button onClick={handleDecrypt} disabled={loading} className="flex-1">
                      <Unlock className="mr-2 h-4 w-4" />
                      Decrypt Data
                    </Button>
                    <Button onClick={testIntegrity} disabled={loading} variant="outline">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Test Data
                    </Button>
                  </div>
                  
                  <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-600 dark:text-blue-400 text-sm">
                      <strong>Tip:</strong> Make sure to use the encrypted data generated on this page. 
                      The decryption uses the exact stego text and keys from the encryption process.
                      If you encrypted elsewhere, you must use those exact outputs here.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No encrypted data available.</p>
                  <p className="text-sm mt-2">Encrypt some data first to see results here.</p>
                  <Button 
                    onClick={() => setActiveTab("input")} 
                    variant="outline" 
                    className="mt-4"
                  >
                    Go to Input
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decrypt Tab */}
        <TabsContent value="decrypt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Decryption Results</CardTitle>
              <CardDescription>
                Decrypted plaintext from layered encryption
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {decryptedData ? (
                <>
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600 dark:text-green-400">
                      Successfully decrypted through all 5 layers!
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>Decrypted Plaintext</Label>
                    <Textarea
                      value={decryptedData}
                      readOnly
                      rows={6}
                      className="font-mono"
                    />
                  </div>

                  {/* Layer-by-Layer Decryption Steps */}
                  {decryptionLayerOutputs.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Layer-by-Layer Decryption</CardTitle>
                        <CardDescription>
                          See how each layer is reversed during decryption
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {decryptionLayerOutputs.map((step: any, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                                  {step.layer}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">{step.name} (Reverse)</h4>
                                  <p className="text-xs text-green-600">✓ {step.status}</p>
                                </div>
                              </div>
                              
                              {step.output && (
                                <div>
                                  <Label className="text-xs text-muted-foreground">Output</Label>
                                  <div className="mt-1 p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded text-xs font-mono break-all">
                                    {typeof step.output === 'string' && step.output.length > 150 
                                      ? `${step.output.substring(0, 150)}...` 
                                      : step.output
                                    }
                                  </div>
                                </div>
                              )}
                              
                              {step.aes_key && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-semibold">AES Key:</span> {step.aes_key}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className={cn(
                      "border-2",
                      extractedWatermark === senderIdentifier ? "border-green-500" : "border-yellow-500"
                    )}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Droplet className="h-4 w-4" />
                          Watermark
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div className="font-mono font-semibold">{extractedWatermark || "N/A"}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {extractedWatermark === senderIdentifier ? "✓ Matches sender" : "⚠ Verification needed"}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={cn(
                      "border-2",
                      signatureValid ? "border-green-500" : "border-red-500"
                    )}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Signature
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div className="font-semibold">{signatureValid ? "✓ Valid" : "✗ Invalid"}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Digital signature verification
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={cn(
                      "border-2",
                      hashValid ? "border-green-500" : "border-red-500"
                    )}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Hash
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <div className="font-semibold">{hashValid ? "✓ Verified" : "✗ Mismatch"}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Data integrity check
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold">Verification Status</p>
                      <p className="text-sm text-muted-foreground">
                        {decryptedData === plaintext 
                          ? "✅ Decrypted text matches original plaintext"
                          : "⚠️ Decrypted text differs from original"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Unlock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No decrypted data available.</p>
                  <p className="text-sm mt-2">Encrypt and decrypt data to see results here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Walkthrough Tab */}
        <TabsContent value="walkthrough" className="space-y-4">
          <LayeredWalkthrough />
        </TabsContent>
      </Tabs>
    </div>
  )
}
