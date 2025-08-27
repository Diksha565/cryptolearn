"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that should have the sidebar
  const sidebarPages = [
    "/aes",
    "/rsa",
    "/ecc",
    "/digital-signature",
    "/steganography",
    "/watermarking",
  ];
  const shouldShowSidebar = sidebarPages.some((page) =>
    pathname.startsWith(page)
  );

  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </SidebarProvider>
    );
  }

  return <>{children}</>;
}
