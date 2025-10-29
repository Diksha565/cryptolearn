"use client";

import { Shield, Loader2 } from "lucide-react";

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <div className="flex items-center gap-2 justify-center mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Checking authentication...
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Please wait while we verify your credentials
        </p>
      </div>
    </div>
  );
}
