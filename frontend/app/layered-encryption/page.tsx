"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, Lock, Unlock, Key, Shield, CheckCircle2, XCircle, Info, Download, Copy } from "lucide-react"
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
  algorithm: string
  input: string
  output: string
  iv?: string
  signature?: string
  key_size?: string
  curve?: string
}

export default function LayeredEncryptionPage() {
  const [activeTab, setActiveTab] = useState("input")
  const [plaintext, setPlaintext] = useState("Hello, this is a secret message that will be encrypted through multiple layers!")
  const [encryptedData, setEncryptedData] = useState("")
  const [decryptedData, setDecryptedData] = useState("")
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
  const [layerOutputs, setLayerOutputs] = useState<LayerOutput[]>([])
  const [keys, setKeys] = useState<any>(null)

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

    try {
      const enabledLayers = getEnabledLayers()
      
      if (enabledLayers.length === 0) {
        setError("Please select at least one encryption layer")
        setLoading(false)
        return
      }

      if (!plaintext.trim()) {
        setError("Please enter text to encrypt")
        setLoading(false)
        return
      }

      // Step 1: Generate keys
      setProgress(20)
      
      console.log('='.repeat(60))
      console.log('ENCRYPTION REQUEST FROM FRONTEND')
      console.log('Plaintext:', plaintext)
      console.log('Plaintext length:', plaintext.length)
      console.log('Enabled layers:', enabledLayers)
      console.log('='.repeat(60))
      
      const keysResponse = await fetch('http://127.0.0.1:5000/api/layered/generate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithms: enabledLayers })
      })

      const keysData = await keysResponse.json()
      
      if (!keysData.success) {
        throw new Error(keysData.error || 'Key generation failed')
      }

      // Store fresh keys in state
      setKeys(keysData.keys)
      setProgress(40)

      // Step 2: Encrypt using the freshly generated keys
      console.log('=== FRONTEND ENCRYPT ===');
      console.log('Plaintext to encrypt:', plaintext);
      console.log('Plaintext length:', plaintext.length);
      console.log('Layers:', enabledLayers);
      console.log('Keys available:', Object.keys(keysData.keys));
      console.log('========================');
      
      const encryptResponse = await fetch('http://127.0.0.1:5000/api/layered/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plaintext,
          layers: enabledLayers,
          keys: keysData.keys  // Use the freshly generated keys
        })
      })

      const encryptData = await encryptResponse.json()
      
      console.log('=== ENCRYPTION SUCCESS ===')
      console.log('Timestamp:', encryptData.timestamp)
      console.log('Unique Nonce:', encryptData.nonce)
      console.log('Encrypted (first 100):', encryptData.encrypted_data?.substring(0, 100))
      console.log('Total length:', encryptData.encrypted_data?.length)
      console.log('=========================')
      
      if (!encryptData.success) {
        throw new Error(encryptData.error || 'Encryption failed')
      }

      setProgress(100)
      setEncryptedData(encryptData.encrypted_data)
      setEncryptionSteps(encryptData.encryption_steps || [])
      setLayerMetadata(encryptData.layer_metadata || [])
      setLayerOutputs(encryptData.layer_outputs || [])  // Store layer-by-layer outputs
      
      // IMPORTANT: Update keys with the ones from encryption (includes IV for AES)
      if (encryptData.keys) {
        setKeys(encryptData.keys)
        console.log('Keys updated with IV:', encryptData.keys.aes?.iv?.substring(0, 32) || 'N/A')
      }
      
      // Show unique encryption metadata
      const uniqueMsg = `Successfully encrypted! 🕒 ${new Date(encryptData.timestamp).toLocaleTimeString()} | 🔑 ID: ${encryptData.nonce.substring(0, 12)}...`
      setSuccess(uniqueMsg)
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
      if (!encryptedData) {
        setError("No encrypted data available")
        setLoading(false)
        return
      }

      if (!keys) {
        setError("Encryption keys not available")
        setLoading(false)
        return
      }

      const enabledLayers = getEnabledLayers()
      setProgress(30)

      const decryptResponse = await fetch('http://127.0.0.1:5000/api/layered/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encrypted_data: encryptedData,
          layers: enabledLayers,
          keys
        })
      })

      const decryptData = await decryptResponse.json()
      
      console.log('=== DECRYPTION RESPONSE ===');
      console.log('Success:', decryptData.success);
      console.log('Plaintext length:', decryptData.plaintext?.length);
      console.log('Plaintext preview:', decryptData.plaintext?.substring(0, 100));
      console.log('=========================');
      
      if (!decryptData.success) {
        throw new Error(decryptData.error || 'Decryption failed')
      }

      setProgress(100)
      setDecryptedData(decryptData.plaintext)
      setSuccess('Successfully decrypted!')
      setActiveTab("decrypt")

    } catch (err: any) {
      setError(err.message || 'Decryption failed')
    } finally {
      setLoading(false)
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
        <h1 className="text-4xl font-bold mb-2">Layered Encryption System</h1>
        <p className="text-muted-foreground text-lg">
          Encrypt your data through multiple cryptographic layers for enhanced security
        </p>
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-semibold mb-2">Encryption Flow:</p>
          <p className="text-sm text-muted-foreground">
            Plaintext → <span className="font-semibold text-primary">RSA (Encrypt)</span> → <span className="font-semibold text-primary">Digital Signature (Sign)</span> → <span className="font-semibold text-primary">AES (Encrypt)</span> → Final Ciphertext
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Each layer's output becomes the input for the next layer, creating multiple security barriers
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
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
                Enter your text and select the encryption layers to apply
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

              <div className="space-y-4">
                <Label>Encryption Layers</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  {layers.map((layer) => (
                    <Card 
                      key={layer.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        layer.enabled ? "border-primary bg-primary/5" : "opacity-60"
                      )}
                      onClick={() => toggleLayer(layer.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={layer.enabled}
                            onCheckedChange={() => toggleLayer(layer.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{layer.icon}</span>
                              <h4 className="font-semibold">{layer.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {layer.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>{getEnabledLayers().length} layer(s) selected</div>
                  <div className="text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    Fresh keys generated for each encryption
                  </div>
                </div>
                <Button 
                  onClick={handleEncrypt} 
                  disabled={loading || getEnabledLayers().length === 0}
                  size="lg"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Encrypt Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Tab */}
        <TabsContent value="process" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Encryption Process</CardTitle>
              <CardDescription>
                Real-time visualization of each encryption layer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {encryptionSteps.length > 0 ? (
                <div className="space-y-4">
                  {encryptionSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full",
                        step.completed ? "bg-green-500 text-white" : "bg-gray-200"
                      )}>
                        {step.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span>{step.step}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold capitalize">
                          Layer {step.step}: {step.algorithm}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {layerMetadata[index]?.algorithm || 'Processing...'}
                        </p>
                      </div>
                      {layerMetadata[index] && (
                        <div className="text-right text-sm">
                          <div>Input: {layerMetadata[index].input_size} bytes</div>
                          <div>Output: {layerMetadata[index].output_size} bytes</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No encryption process started yet.</p>
                  <p className="text-sm mt-2">Go to the Input tab to begin encryption.</p>
                </div>
              )}
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
              {encryptedData ? (
                <>
                  {/* Unique Encryption Info Badge */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Unique Encryption</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Each encryption generates a unique timestamp and random nonce, 
                      ensuring no two encryptions are identical - even for the same plaintext.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Encrypted Data</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(encryptedData)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={encryptedData}
                      readOnly
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-muted-foreground">
                      {encryptedData.length} characters (includes timestamp + nonce + encrypted layers)
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original Size:</span>
                          <span className="font-mono">{plaintext.length} bytes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Encrypted Size:</span>
                          <span className="font-mono">{encryptedData.length} bytes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Layers Applied:</span>
                          <span className="font-mono">{encryptionSteps.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Encryption Ratio:</span>
                          <span className="font-mono">
                            {((encryptedData.length / plaintext.length) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Security Layers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {layerMetadata.map((meta, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Shield className="h-4 w-4 text-primary" />
                              <span>{meta.algorithm}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Layer-by-Layer Output Display */}
                  {layerOutputs.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Layer-by-Layer Encryption Output</CardTitle>
                        <CardDescription>
                          See the actual encrypted output after each layer is applied
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {layerOutputs.map((layer, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                    {layer.layer}
                                  </div>
                                  <h4 className="font-semibold text-sm">{layer.algorithm}</h4>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(layer.output)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs text-muted-foreground">Input ({layer.input.length} chars)</Label>
                                  <div className="mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                                    {layer.input.length > 150 
                                      ? `${layer.input.substring(0, 150)}...` 
                                      : layer.input
                                    }
                                  </div>
                                </div>
                                
                                <div className="flex justify-center py-1">
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                                
                                <div>
                                  <Label className="text-xs text-muted-foreground">Output ({layer.output.length} chars)</Label>
                                  <div className="mt-1 p-2 bg-primary/5 border border-primary/20 rounded text-xs font-mono break-all">
                                    {layer.output.length > 150 
                                      ? `${layer.output.substring(0, 150)}...` 
                                      : layer.output
                                    }
                                  </div>
                                </div>
                                
                                {layer.iv && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-semibold">IV:</span> {layer.iv.substring(0, 32)}...
                                  </div>
                                )}
                                
                                {layer.signature && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-semibold">Signature:</span> {layer.signature.substring(0, 48)}...
                                  </div>
                                )}
                              </div>
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
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No encrypted data available.</p>
                  <p className="text-sm mt-2">Encrypt some data first to see results here.</p>
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
                      Successfully decrypted through all layers!
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>Decrypted Text</Label>
                    <Textarea
                      value={decryptedData}
                      readOnly
                      rows={6}
                      className="font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold">Verification</p>
                      <p className="text-sm text-muted-foreground">
                        {decryptedData === plaintext 
                          ? "✅ Decrypted text matches original"
                          : "⚠️ Decrypted text differs from original"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Unlock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No decrypted data available.</p>
                  <p className="text-sm mt-2">Decrypt encrypted data to see results here.</p>
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
