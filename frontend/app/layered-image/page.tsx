"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Image as ImageIcon, CheckCircle2, XCircle, Download, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LayeredImagePage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [secretMessage, setSecretMessage] = useState("This is a hidden secret message!")
  const [watermarkText, setWatermarkText] = useState("CryptoLearn")
  const [stegMethod, setStegMethod] = useState("lsb")
  const [watermarkType, setWatermarkType] = useState("invisible")
  const [extractedMessage, setExtractedMessage] = useState("")
  const [extractedWatermark, setExtractedWatermark] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setOriginalImage(base64)
      setSuccess("Image uploaded successfully!")
      setTimeout(() => setSuccess(""), 2000)
    }
    reader.readAsDataURL(file)
  }

  const handleProcess = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      if (!originalImage) {
        setError("Please upload an image first")
        setLoading(false)
        return
      }

      if (!secretMessage && !watermarkText) {
        setError("Please provide at least a secret message or watermark text")
        setLoading(false)
        return
      }

      const response = await fetch('http://127.0.0.1:5000/api/layered-image/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: originalImage.split(',')[1], // Remove data:image/png;base64, prefix
          secret_message: secretMessage || undefined,
          watermark_text: watermarkText || undefined,
          steg_method: stegMethod,
          watermark_type: watermarkType
        })
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Processing failed')
      }

      setProcessedImage(`data:image/png;base64,${data.processed_image}`)
      setSuccess('Image processed successfully!')
      setActiveTab("process")

    } catch (err: any) {
      setError(err.message || 'Processing failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExtract = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      if (!processedImage) {
        setError("No processed image available")
        setLoading(false)
        return
      }

      console.log("Extracting from image...")
      console.log("Extract stego:", !!secretMessage)
      console.log("Extract watermark:", !!watermarkText)
      console.log("Watermark length:", watermarkText.length)

      const response = await fetch('http://127.0.0.1:5000/api/layered-image/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: processedImage.split(',')[1],
          extract_stego: !!secretMessage,
          extract_watermark: !!watermarkText,
          watermark_length: watermarkText ? watermarkText.length : 10
        })
      })

      const data = await response.json()
      
      console.log("Extraction response:", data)
      
      if (!data.success) {
        throw new Error(data.error || 'Extraction failed')
      }

      // Extract the data
      const hiddenMsg = data.extracted_data?.hidden_message || ""
      const watermark = data.extracted_data?.watermark || ""
      
      console.log("Extracted message:", hiddenMsg)
      console.log("Extracted watermark:", watermark)

      setExtractedMessage(hiddenMsg)
      setExtractedWatermark(watermark)
      
      if (hiddenMsg || watermark) {
        setSuccess('Data extracted successfully!')
        setActiveTab("extract")
      } else {
        setError('No data could be extracted from the image')
      }

    } catch (err: any) {
      console.error("Extraction error:", err)
      setError(err.message || 'Extraction failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = () => {
    if (!processedImage) return
    
    const link = document.createElement('a')
    link.href = processedImage
    link.download = 'layered-image.png'
    link.click()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Layered Image Processing</h1>
        <p className="text-muted-foreground text-lg">
          Combine steganography and watermarking to protect and hide data in images
        </p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="extract">Extract</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Select an image file (PNG or JPG) to begin processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                {originalImage ? (
                  <div className="space-y-4">
                    <img 
                      src={originalImage} 
                      alt="Uploaded" 
                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                    <Button variant="outline" onClick={() => setOriginalImage(null)}>
                      Upload Different Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-semibold mb-2">Drag and drop your image here</p>
                      <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageUpload}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>

              {originalImage && (
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("configure")}>
                    Next: Configure Options
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configure Tab */}
        <TabsContent value="configure" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EyeOff className="h-5 w-5" />
                  Steganography Settings
                </CardTitle>
                <CardDescription>
                  Hide a secret message within the image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret Message</Label>
                  <Textarea
                    id="secret"
                    value={secretMessage}
                    onChange={(e) => setSecretMessage(e.target.value)}
                    placeholder="Enter message to hide..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {secretMessage.length} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="steg-method">Steganography Method</Label>
                  <Select value={stegMethod} onValueChange={setStegMethod}>
                    <SelectTrigger id="steg-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lsb">LSB (Least Significant Bit)</SelectItem>
                      <SelectItem value="dct">DCT (Discrete Cosine Transform)</SelectItem>
                      <SelectItem value="spatial">Spatial Domain</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {stegMethod === 'lsb' && 'Most common and efficient method'}
                    {stegMethod === 'dct' && 'More robust against compression'}
                    {stegMethod === 'spatial' && 'Enhanced security with spread spectrum'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Watermarking Settings
                </CardTitle>
                <CardDescription>
                  Add a watermark to protect your image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="watermark">Watermark Text</Label>
                  <Input
                    id="watermark"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text..."
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    {watermarkText.length}/20 characters (keep it short for better compatibility)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="watermark-type">Watermark Type</Label>
                  <Select value={watermarkType} onValueChange={setWatermarkType}>
                    <SelectTrigger id="watermark-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Visible Text Watermark</SelectItem>
                      <SelectItem value="invisible">Invisible Watermark</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {watermarkType === 'text' 
                      ? 'Watermark will be clearly visible on the image'
                      : 'Watermark will be embedded invisibly using DCT'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setActiveTab("upload")}>
              Back
            </Button>
            <Button onClick={handleProcess} disabled={loading}>
              {loading ? 'Processing...' : 'Process Image'}
            </Button>
          </div>
        </TabsContent>

        {/* Process Tab */}
        <TabsContent value="process" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processed Image</CardTitle>
              <CardDescription>
                Image with applied steganography and watermarking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {processedImage ? (
                <>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <img 
                      src={processedImage} 
                      alt="Processed" 
                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Applied Layers</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {secretMessage && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Steganography ({stegMethod.toUpperCase()})</span>
                          </div>
                        )}
                        {watermarkText && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Watermark ({watermarkType})</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={downloadImage}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Image
                        </Button>
                        <Button 
                          className="w-full"
                          onClick={handleExtract}
                          disabled={loading}
                        >
                          Extract Hidden Data
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No processed image available.</p>
                  <p className="text-sm mt-2">Configure and process an image first.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extract Tab */}
        <TabsContent value="extract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Data</CardTitle>
              <CardDescription>
                Hidden data recovered from the processed image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!processedImage ? (
                <div className="text-center py-12 text-muted-foreground">
                  <EyeOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No processed image available.</p>
                  <p className="text-sm mt-2">Upload and process an image first.</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleExtract} 
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "Extracting..." : "Extract Hidden Data"}
                    </Button>
                  </div>

                  {(extractedMessage || extractedWatermark) && (
                    <>
                      {extractedMessage && (
                        <div className="space-y-2">
                          <Label>Extracted Secret Message</Label>
                          <Textarea
                            value={extractedMessage}
                            readOnly
                            rows={4}
                            className="font-mono"
                          />
                          <div className="flex items-center gap-2 text-sm">
                            {extractedMessage === secretMessage ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">✓ Message matches original</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-amber-600" />
                                <span className="text-amber-600">⚠ Message differs from original</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {extractedWatermark && (
                        <div className="space-y-2">
                          <Label>Detected Watermark</Label>
                          <Input
                            value={extractedWatermark}
                            readOnly
                            className="font-mono"
                          />
                          <div className="flex items-center gap-2 text-sm">
                            {extractedWatermark === watermarkText ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">✓ Watermark matches original</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-amber-600" />
                                <span className="text-amber-600">⚠ Watermark extraction is approximate</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!extractedMessage && !extractedWatermark && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <p>Click "Extract Hidden Data" to recover the secret message and watermark.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Comparison</CardTitle>
              <CardDescription>
                Side-by-side comparison of original and processed images
              </CardDescription>
            </CardHeader>
            <CardContent>
              {originalImage && processedImage ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-center">Original Image</h4>
                    <div className="border rounded-lg p-2 bg-muted/20">
                      <img 
                        src={originalImage} 
                        alt="Original" 
                        className="w-full rounded"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-center">Processed Image</h4>
                    <div className="border rounded-lg p-2 bg-muted/20">
                      <img 
                        src={processedImage} 
                        alt="Processed" 
                        className="w-full rounded"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No images to compare.</p>
                  <p className="text-sm mt-2">Process an image first to enable comparison.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
