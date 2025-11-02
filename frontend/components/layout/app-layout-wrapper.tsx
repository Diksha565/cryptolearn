"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 flex-1">
              <h2 className="text-lg font-semibold">CryptoLearn</h2>
            </div>
            <ThemeToggle />
          </header>
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return <>{children}</>;
}
