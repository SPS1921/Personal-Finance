"use client";
import { motion } from "framer-motion";

export function FinancialHealthGauge({ score }: { score: number }) {
  const angle = (Math.max(0, Math.min(100, score)) / 100) * 180;
  const grade =
    score >= 80 ? { label: "Excellent", color: "text-emerald-500" } :
    score >= 60 ? { label: "Healthy", color: "text-teal-500" } :
    score >= 40 ? { label: "Watch", color: "text-amber-500" } :
                  { label: "At risk", color: "text-red-500" };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-44 h-24 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 opacity-20" />
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom h-[88px] w-0.5 bg-foreground rounded-full"
          initial={{ rotate: -90 }}
          animate={{ rotate: angle - 90 }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-foreground" />
      </div>
      <div className="mt-2 text-center">
        <p className="number text-3xl font-semibold">{score}</p>
        <p className={`text-xs font-medium ${grade.color}`}>{grade.label}</p>
      </div>
    </div>
  );
}
