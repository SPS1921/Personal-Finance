"use client";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { formatCompact } from "@/lib/utils";

export function ForecastChart({ data }: { data: { month: string; balance: number; savings: number; debt: number; wealth: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={50} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          formatter={(v: any) => `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="wealth" stroke="#6366f1" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="savings" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="debt" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
