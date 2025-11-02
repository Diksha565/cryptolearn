"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Image as ImageIcon, Lock, Eye, ArrowRight, Layers, FileText } from "lucide-react"

export default function LayeredLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-6">
            <Layers className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Layered Security
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your security method: Multi-layer text encryption or advanced image protection
          </p>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Layered Text Encryption Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-1">Layered Text Encryption</CardTitle>
                  <p className="text-sm text-muted-foreground">Advanced 5-layer cryptographic system</p>
                </div>
              </div>
              <CardDescription className="text-base">
                Secure your text data with 5 layers of advanced encryption: AES → Key Encryption → Watermarking → Signature → Steganography
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-600" />
                  Encryption Layers (5-Layer System)
                </h4>
                <div className="space-y-2 ml-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm"><strong>Layer 1:</strong> AES-256-CBC Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm"><strong>Layer 2:</strong> RSA/ECC Key Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm"><strong>Layer 3:</strong> Zero-Width Watermarking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-sm"><strong>Layer 4:</strong> SHA-256 + Digital Signature</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm"><strong>Layer 5:</strong> Whitespace Steganography</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Features</h4>
                <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                  <li>• 5-layer defense in depth encryption</li>
                  <li>• Hybrid cryptography (AES + RSA/ECC)</li>
                  <li>• Zero-width Unicode watermarking</li>
                  <li>• Data integrity with SHA-256 + signatures</li>
                  <li>• Stealth whitespace steganography</li>
                  <li>• Interactive animated walkthrough</li>
                </ul>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" 
                asChild
              >
                <Link href="/layered-encryption">
                  Start Text Encryption
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Layered Image Processing Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-1">Layered Image Processing</CardTitle>
                  <p className="text-sm text-muted-foreground">Steganography + Watermarking</p>
                </div>
              </div>
              <CardDescription className="text-base">
                Hide secret messages and protect images with advanced steganography and watermarking techniques
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  Processing Layers
                </h4>
                <div className="space-y-2 ml-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm"><strong>Layer 1:</strong> LSB Steganography</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-sm"><strong>Layer 2:</strong> Digital Watermarking</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Techniques Available</h4>
                <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                  <li>• LSB, DCT, and Spatial domain steganography</li>
                  <li>• Visible and invisible watermarking</li>
                  <li>• Message extraction and watermark detection</li>
                  <li>• Image comparison and analysis tools</li>
                </ul>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700" 
                asChild
              >
                <Link href="/layered-image">
                  Start Image Processing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="border-2 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              What are Layered Security Techniques?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Layered security, also known as "defense in depth," applies multiple independent security controls 
              to protect data. This approach ensures that if one layer fails, others continue to provide protection.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Text Encryption Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Multiple algorithm protection</li>
                  <li>✓ Integrity verification</li>
                  <li>✓ Non-repudiation</li>
                  <li>✓ Maximum security</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Image Processing Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Covert communication</li>
                  <li>✓ Copyright protection</li>
                  <li>✓ Imperceptible changes</li>
                  <li>✓ Data authentication</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
