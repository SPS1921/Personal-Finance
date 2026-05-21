"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  version: number;
  bumpVersion: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  range: "7d" | "30d" | "90d" | "365d";
  setRange: (r: StoreState["range"]) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      version: 0,
      bumpVersion: () => set((s) => ({ version: s.version + 1 })),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      currency: "INR",
      setCurrency: (c) => set({ currency: c }),
      range: "30d",
      setRange: (r) => set({ range: r }),
    }),
    { name: "finance-os" },
  ),
);
