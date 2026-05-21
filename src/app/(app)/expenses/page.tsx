"use client";
import { useState } from "react";
import { Plus, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseTable } from "@/components/ExpenseTable";
import { QuickAddModal } from "@/components/QuickAddModal";
import { useApi } from "@/lib/fetcher";

const CATEGORIES = ["", "FOOD","TRAVEL","RENT","EMI","SHOPPING","ENTERTAINMENT","INVESTMENT","UTILITIES","HEALTH","FAMILY","BUSINESS","MISC"];

export default function ExpensesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [range, setRange] = useState("30");
  const [openAdd, setOpenAdd] = useState(false);

  const from = new Date(); from.setDate(from.getDate() - Number(range));
  const url = `/api/transactions?take=100&type=${type}&from=${from.toISOString()}${q ? `&q=${encodeURIComponent(q)}` : ""}${cat ? `&category=${cat}` : ""}`;
  const { data } = useApi<any>(url);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">Search, filter, and manage every transaction.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/api/export/csv">
            <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> Export</Button>
          </a>
          <Button size="sm" onClick={() => setOpenAdd(true)}><Plus className="h-3.5 w-3.5" /> Add</Button>
        </div>
      </div>

      <div className="bento p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search merchant" className="pl-8" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All categories</SelectItem>
            {CATEGORIES.filter(Boolean).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Tabs value={range} onValueChange={setRange}>
          <TabsList>
            <TabsTrigger value="7">7D</TabsTrigger>
            <TabsTrigger value="30">30D</TabsTrigger>
            <TabsTrigger value="90">90D</TabsTrigger>
            <TabsTrigger value="365">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={type} onValueChange={setType}>
          <TabsList>
            <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
            <TabsTrigger value="INCOME">Income</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ExpenseTable items={data?.items ?? []} />
      <QuickAddModal open={openAdd} onOpenChange={setOpenAdd} />
    </div>
  );
}
