import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Info, Lightbulb } from "lucide-react"

interface ExplanationCardProps {
  title: string
  description: string
  theory: string
  useCases: string[]
  pros: string[]
  cons: string[]
  complexity?: string
  keySize?: string
  children?: React.ReactNode
}

export function ExplanationCard({
  title,
  description,
  theory,
  useCases,
  pros,
  cons,
  complexity,
  keySize,
  children,
}: ExplanationCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-base mt-2">{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {complexity && (
              <Badge variant="outline">
                <Info className="w-3 h-3 mr-1" />
                {complexity}
              </Badge>
            )}
            {keySize && <Badge variant="secondary">Key: {keySize}</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theory Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            How it Works
          </h3>
          <p className="text-muted-foreground leading-relaxed">{theory}</p>
        </div>

        <Separator />

        {/* Use Cases */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Common Use Cases</h3>
          <ul className="space-y-2">
            {useCases.map((useCase, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0" />
                <span className="text-muted-foreground">{useCase}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Pros and Cons */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              Advantages
            </h3>
            <ul className="space-y-2">
              {pros.map((pro, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center text-red-600">
              <XCircle className="w-5 h-5 mr-2" />
              Limitations
            </h3>
            <ul className="space-y-2">
              {cons.map((con, index) => (
                <li key={index} className="flex items-start">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {children && (
          <>
            <Separator />
            {children}
          </>
        )}
      </CardContent>
    </Card>
  )
}
