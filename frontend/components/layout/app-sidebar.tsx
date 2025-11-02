"use client";

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
  X,
  Layers,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
  {
    id: "layered",
    name: "Layered Security",
    href: "/layered",
    icon: Layers,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpen, open } = useSidebar();

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
            onClick={() => setOpen(!open)}
            className="h-8 w-8 md:hidden"
            aria-label="Toggle sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
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
                    className="flex items-center gap-3 w-full"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{topic.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
