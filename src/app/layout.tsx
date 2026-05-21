import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Finance OS — Your money, intelligent",
  description: "AI-powered personal finance operating system",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Finance OS", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0a0a0b" }, { media: "(prefers-color-scheme: light)", color: "#ffffff" }],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background bg-mesh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
