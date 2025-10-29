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
    </Sidebar>
  );
}
