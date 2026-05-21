"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bento p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Finance OS</h1>
            <p className="text-xs text-muted-foreground">Your money, intelligent.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to sync your data, set goals, and let AI keep you on track.
        </p>
        <Button className="w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          Continue with Google
        </Button>
        <p className="mt-4 text-[11px] text-muted-foreground text-center">
          You can also explore the demo account without signing in.
        </p>
      </div>
    </div>
  );
}
