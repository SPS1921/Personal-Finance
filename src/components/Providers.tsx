"use client";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { RealtimeBridge } from "./RealtimeBridge";

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } }));
  return (
    <SessionProvider>
      <QueryClientProvider client={qc}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <RealtimeBridge />
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
