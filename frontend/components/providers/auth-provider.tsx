"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "@/lib/api";
import { AuthLoadingScreen } from "@/components/auth-loading-screen";

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      // Set a timeout for the auth check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch('http://127.0.0.1:5000/api/auth/check', {
        credentials: 'include',
        signal: controller.signal
      }).then(res => res.json());

      clearTimeout(timeoutId);

      if (response.authenticated && response.user) {
        setUser(response.user);
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // On failure, don't block - just assume not authenticated
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Protected routes - require authentication
  const protectedRoutes = [
    "/aes",
    "/rsa",
    "/ecc",
    "/digital-signature",
    "/steganography",
    "/watermarking",
    "/layered",
    // "/layered-encryption", // Removed - allow public access for demo
    "/layered-image",
  ];

  useEffect(() => {
    if (!loading && !user) {
      // Check if current path is protected
      const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isProtected) {
        // Store the intended destination
        localStorage.setItem("redirectAfterLogin", pathname);
        // Redirect to login
        router.push("/login");
      }
    }
  }, [loading, user, pathname]);

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    if (response.success && response.user) {
      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Redirect to intended page or home
      const redirectTo = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      router.push(redirectTo);
    } else {
      throw new Error(response.error || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      router.push("/");
    }
  };

  // Show loading screen on protected routes while checking auth
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (loading && isProtected) {
    return <AuthLoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
