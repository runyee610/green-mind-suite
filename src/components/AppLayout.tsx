import { Bell, Search, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });
  const timeStr = now.toLocaleTimeString("zh-CN", { hour12: false });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card px-4 sticky top-0 z-30 shadow-sm">
            <div className="hidden md:flex items-center gap-2">
              <span className="glow-dot" />
              <span className="text-sm text-muted-foreground">系统运行正常</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
                <span>{dateStr}</span>
                <span className="font-mono text-primary">{timeStr}</span>
              </div>

              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="搜索设备 / 报表..."
                  className="h-8 w-56 pl-8 bg-muted/40 border-border text-xs"
                />
              </div>

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
                <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="hidden md:inline text-xs text-foreground">管理员</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
