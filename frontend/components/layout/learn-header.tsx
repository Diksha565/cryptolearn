"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface LearnHeaderProps {
  title: string
  description: string
}

export function LearnHeader({ title, description }: LearnHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}
