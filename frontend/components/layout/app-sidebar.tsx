"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Home,
  Shield,
  Key,
  Zap,
  FileSignature,
  ImageIcon,
  Eye,
  Check,
  X,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const topics = [
  { id: "home", name: "Back to Home", href: "/", icon: Home },
  { id: "aes", name: "AES Encryption", href: "/aes", icon: Shield },
  { id: "rsa", name: "RSA Algorithm", href: "/rsa", icon: Key },
  { id: "ecc", name: "ECC Cryptography", href: "/ecc", icon: Zap },
  {
    id: "digital-signature",
    name: "Digital Signature",
    href: "/digital-signature",
    icon: FileSignature,
  },
  {
    id: "watermarking",
    name: "Watermarking",
    href: "/watermarking",
    icon: ImageIcon,
  },
  {
    id: "steganography",
    name: "Steganography",
    href: "/steganography",
    icon: Eye,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(
    new Set()
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const completed = localStorage.getItem("cryptolearn-completed");
    if (completed) {
      setCompletedTopics(new Set(JSON.parse(completed)));
    }
  }, []);

  useEffect(() => {
    // Mark current topic as visited
    const currentTopic = topics.find((topic) => topic.href === pathname);
    if (currentTopic && currentTopic.id !== "home") {
      // Only update if the topic isn't already completed
      if (!completedTopics.has(currentTopic.id)) {
        const newCompleted = new Set(completedTopics);
        newCompleted.add(currentTopic.id);
        setCompletedTopics(newCompleted);
        localStorage.setItem(
          "cryptolearn-completed",
          JSON.stringify(Array.from(newCompleted))
        );
      }
    }
  }, [pathname]); // Remove completedTopics from dependencies

  if (!mounted) {
    return null;
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">CryptoLearn</h1>
              <p className="text-sm text-muted-foreground">
                Master Cryptography
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu>
          {topics.map((topic) => {
            const Icon = topic.icon;
            const isActive = pathname === topic.href;
            const isCompleted = completedTopics.has(topic.id);

            return (
              <SidebarMenuItem key={topic.id}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={topic.href}
                    className="flex items-center gap-3 w-full"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{topic.name}</span>
                    {isCompleted && topic.id !== "home" && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-sm text-muted-foreground text-center">
          {completedTopics.size}/6 Topics Complete
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
