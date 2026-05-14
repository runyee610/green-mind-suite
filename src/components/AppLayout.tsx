import { Bell, Sun, User, Building2, Briefcase, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole, type Role } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  title?: string;
  subtitle?: React.ReactNode;
  hideHeader?: boolean;
  children: React.ReactNode;
}

const ROUTE_TITLES: Array<{ match: RegExp; crumbs: string[] }> = [
  { match: /^\/$/, crumbs: ["绿色制造", "全景视图看板"] },
  { match: /^\/green-mfg\/(gov|ent)\/incubator/, crumbs: ["绿色制造", "梯度培育"] },
  { match: /^\/green-mfg\/(gov|ent)\/dynamic\/[^/]+/, crumbs: ["绿色制造", "动态管理", "详情"] },
  { match: /^\/green-mfg\/(gov|ent)\/dynamic/, crumbs: ["绿色制造", "动态管理"] },
  { match: /^\/green-mfg\/(gov|ent)\/declaration\/new/, crumbs: ["绿色制造", "自评价管理", "新建申报"] },
  { match: /^\/green-mfg\/(gov|ent)\/declaration\/[^/]+/, crumbs: ["绿色制造", "自评价管理", "详情"] },
  { match: /^\/green-mfg\/(gov|ent)$/, crumbs: ["绿色制造", "自评价管理"] },
  { match: /^\/green-mfg-agent/, crumbs: ["绿色制造", "数据智能"] },
  { match: /^\/policy-agent/, crumbs: ["绿色制造", "政策推送"] },
  { match: /^\/report-monthly\/filling/, crumbs: ["节能月度报告", "月度报告管理", "填报"] },
  { match: /^\/report-monthly/, crumbs: ["节能月度报告", "月度报告管理"] },
  { match: /^\/energy-quota\/standard/, crumbs: ["能耗限额管理", "标准管理"] },
  { match: /^\/energy-quota\/declaration/, crumbs: ["能耗限额管理", "周期与申报"] },
  { match: /^\/energy-quota/, crumbs: ["能耗限额管理"] },
  { match: /^\/assets/, crumbs: ["固定资产投资项目", "投资项目管理"] },
  { match: /^\/system\/users/, crumbs: ["系统管理", "用户管理"] },
  { match: /^\/system\/permissions/, crumbs: ["系统管理", "权限管理"] },
  { match: /^\/system/, crumbs: ["系统管理"] },
];

function getCrumbs(pathname: string): string[] {
  for (const r of ROUTE_TITLES) if (r.match.test(pathname)) return r.crumbs;
  return ["页面"];
}

export function AppLayout({ title, subtitle, hideHeader = false, children }: AppLayoutProps) {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const crumbs = getCrumbs(pathname);

  const switchRole = (next: Role) => {
    if (next === role) return;
    setRole(next);
    const m = pathname.match(/^\/green-mfg\/(gov|ent)(\/.*)?$/);
    if (m) {
      const rest = m[2] ?? "";
      navigate(`/green-mfg/${next}${rest}`);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card px-4 sticky top-0 z-30 shadow-sm">
            <nav className="flex items-center gap-1.5 text-sm min-w-0" aria-label="面包屑">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />}
                  <span
                    className={cn(
                      "truncate",
                      i === crumbs.length - 1
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {c}
                  </span>
                </span>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-destructive text-destructive-foreground text-[10px]">
                  3
                </Badge>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Sun className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="inline-flex items-center rounded-md border border-border bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => switchRole("gov")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition",
                      role === "gov"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Building2 className="h-3 w-3" />政府侧
                  </button>
                  <button
                    type="button"
                    onClick={() => switchRole("ent")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition",
                      role === "ent"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Briefcase className="h-3 w-3" />企业侧
                  </button>
                </div>
                <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="hidden md:inline text-xs text-foreground">管理员</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 animate-fade-in">
            {!hideHeader && title ? (
              <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
