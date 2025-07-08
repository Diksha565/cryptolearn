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
  SidebarTrigger,
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
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

const topics = [
  { id: "home", name: "Home", href: "/", icon: Home },
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

export function TopicSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu>
          {topics.map((topic) => {
            const Icon = topic.icon;
            const isActive = pathname === topic.href;

            return (
              <SidebarMenuItem key={topic.id}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link
                    href={topic.href}
                    className={`flex items-center gap-3 w-full transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-600/10 border-r-2 border-blue-500 font-semibold"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-blue-600 dark:text-blue-400" : ""
                      }`}
                    />
                    <span className="flex-1">{topic.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
