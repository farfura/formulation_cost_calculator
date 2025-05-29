"use client";

import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { SupabaseProvider } from "@/contexts/SupabaseProvider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <CurrencyProvider>
          {children}
          <Toaster />
        </CurrencyProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
} 