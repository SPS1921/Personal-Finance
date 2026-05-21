"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GoalTracker } from "@/components/GoalTracker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApi } from "@/lib/fetcher";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export default function GoalsPage() {
  const { data } = useApi<any>("/api/goals");
  const refresh = useStore((s) => s.bumpVersion);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", emoji: "🎯", targetAmount: "", savedAmount: "0", deadline: "", monthlyTarget: "" });

  const items = data?.items ?? [];
  const active = items.filter((g: any) => g.status === "ACTIVE");
  const achieved = items.filter((g: any) => g.status === "ACHIEVED");

  async function save() {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, targetAmount: Number(form.targetAmount), savedAmount: Number(form.savedAmount), monthlyTarget: form.monthlyTarget ? Number(form.monthlyTarget) : undefined }),
    });
    if (!res.ok) return toast.error("Failed");
    toast.success("Goal created");
    setOpen(false);
    refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">Save toward what matters. Short-term to long-term.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5" /> New goal</Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="achieved">Achieved ({achieved.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active"><GoalTracker goals={active} /></TabsContent>
        <TabsContent value="achieved"><GoalTracker goals={achieved} /></TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New goal</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <div><Label>Emoji</Label><Input value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} /></div>
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Target</Label><Input type="number" value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} /></div>
              <div><Label>Saved</Label><Input type="number" value={form.savedAmount} onChange={(e) => setForm((f) => ({ ...f, savedAmount: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} /></div>
              <div><Label>Monthly target</Label><Input type="number" value={form.monthlyTarget} onChange={(e) => setForm((f) => ({ ...f, monthlyTarget: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
