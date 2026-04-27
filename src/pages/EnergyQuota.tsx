import { useState } from "react";
import { BookOpen, ClipboardList, Gauge } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StandardManagement } from "@/components/energy-quota/StandardManagement";
import { CycleAndDeclaration } from "@/components/energy-quota/CycleAndDeclaration";
import { cn } from "@/lib/utils";

type SubPage = "standard" | "cycle";

const subNav: { id: SubPage; title: string; subtitle: string; icon: typeof BookOpen }[] = [
  { id: "standard", title: "标准库管理", subtitle: "GB / DB 能耗限额标准", icon: BookOpen },
  { id: "cycle", title: "限额周期与申报", subtitle: "周期概览 · 企业申报 · 审批流程", icon: ClipboardList },
];

export default function EnergyQuota() {
  const [active, setActive] = useState<SubPage>("standard");
  const current = subNav.find((n) => n.id === active)!;

  return (
    <AppLayout title="能源消耗限额管理" subtitle="政府监管端 · 标准管理 · 限额周期 · 企业申报与审批">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* 子模块侧边导航 */}
        <aside className="panel sticky top-16 h-fit p-3">
          <div className="mb-2 flex items-center gap-2 px-2 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Gauge className="h-3.5 w-3.5" />模块导航
          </div>
          <nav className="space-y-1">
            {subNav.map((n) => {
              const Icon = n.icon;
              const isActive = active === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setActive(n.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-md px-3 py-2.5 text-left transition",
                    isActive
                      ? "bg-primary/10 border-l-2 border-primary text-primary"
                      : "border-l-2 border-transparent hover:bg-muted/40 text-foreground/80",
                  )}
                >
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium leading-tight", isActive && "text-primary")}>{n.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{n.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </nav>
          <div className="mt-4 rounded-md border border-border/60 bg-muted/20 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground/80">{current.title}</p>
            <p>{current.subtitle}</p>
          </div>
        </aside>

        <section className="min-w-0">
          {active === "standard" ? <StandardManagement /> : <CycleAndDeclaration />}
        </section>
      </div>
    </AppLayout>
  );
}
