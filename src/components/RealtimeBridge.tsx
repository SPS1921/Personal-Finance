"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

export function RealtimeBridge() {
  const bump = useStore((s) => s.bumpVersion);
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("finance-os")
      .on("postgres_changes", { event: "*", schema: "public", table: "Transaction" }, () => bump())
      .on("postgres_changes", { event: "*", schema: "public", table: "Budget" }, () => bump())
      .on("postgres_changes", { event: "*", schema: "public", table: "Goal" }, () => bump())
      .on("postgres_changes", { event: "*", schema: "public", table: "ImportJob" }, () => bump())
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, [bump]);
  return null;
}
